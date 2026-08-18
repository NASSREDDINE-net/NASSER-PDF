
import os,uuid
from pathlib import Path
from datetime import datetime,timedelta,timezone
from fastapi import FastAPI,Depends,HTTPException,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer
from jose import jwt,JWTError
from passlib.context import CryptContext
from pydantic import BaseModel,EmailStr
from sqlalchemy import create_engine,String,Integer,Boolean,DateTime,ForeignKey,BigInteger
from sqlalchemy.orm import DeclarativeBase,Mapped,mapped_column,relationship,sessionmaker,Session
DB=os.getenv("DATABASE_URL","sqlite:///./nasser_pdf.db");SECRET=os.getenv("JWT_SECRET","CHANGE_ME");STORE=Path(os.getenv("STORAGE_DIR","./storage"));STORE.mkdir(exist_ok=True)
engine=create_engine(DB,connect_args={"check_same_thread":False} if DB.startswith("sqlite") else {});SessionLocal=sessionmaker(bind=engine)
class Base(DeclarativeBase):pass
class User(Base):
 __tablename__="users";id:Mapped[int]=mapped_column(primary_key=True);email:Mapped[str]=mapped_column(String(320),unique=True);name:Mapped[str]=mapped_column(String(120),default="");password_hash:Mapped[str]=mapped_column(String(255));plan:Mapped[str]=mapped_column(String(20),default="free");created_at:Mapped[datetime]=mapped_column(DateTime,default=lambda:datetime.now(timezone.utc))
class Document(Base):
 __tablename__="documents";id:Mapped[int]=mapped_column(primary_key=True);owner_id:Mapped[int]=mapped_column(ForeignKey("users.id"));original_name:Mapped[str]=mapped_column(String(255));stored_name:Mapped[str]=mapped_column(String(255),unique=True);size_bytes:Mapped[int]=mapped_column(BigInteger);mime_type:Mapped[str]=mapped_column(String(120));operation:Mapped[str]=mapped_column(String(80),default="upload");created_at:Mapped[datetime]=mapped_column(DateTime,default=lambda:datetime.now(timezone.utc))
class Usage(Base):
 __tablename__="usage";id:Mapped[int]=mapped_column(primary_key=True);owner_id:Mapped[int]=mapped_column(ForeignKey("users.id"),unique=True);month:Mapped[str]=mapped_column(String(7));operations:Mapped[int]=mapped_column(Integer,default=0)
Base.metadata.create_all(engine)
pwd=CryptContext(schemes=["bcrypt"],deprecated="auto");oauth=OAuth2PasswordBearer(tokenUrl="/api/auth/login");app=FastAPI(title="NASSER PDF API")
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
class Auth(BaseModel):email:EmailStr;password:str;name:str=""
class Plan(BaseModel):plan:str
def db():
 s=SessionLocal()
 try:yield s
 finally:s.close()
def token(u):return jwt.encode({"sub":str(u.id),"exp":datetime.now(timezone.utc)+timedelta(days=7)},SECRET,algorithm="HS256")
def me(t:str=Depends(oauth),s:Session=Depends(db)):
 try:i=int(jwt.decode(t,SECRET,algorithms=["HS256"])["sub"])
 except:raise HTTPException(401,"Invalid session")
 u=s.get(User,i)
 if not u:raise HTTPException(401,"User not found")
 return u
def use(u,s):
 m=datetime.now(timezone.utc).strftime("%Y-%m");x=s.query(Usage).filter_by(owner_id=u.id).first()
 if not x:x=Usage(owner_id=u.id,month=m,operations=0);s.add(x);s.commit()
 if x.month!=m:x.month=m;x.operations=0;s.commit()
 return x
@app.get("/api/health")
def health():return{"ok":True}
@app.post("/api/auth/register")
def register(a:Auth,s:Session=Depends(db)):
 if len(a.password)<8:raise HTTPException(400,"Password must be 8+ characters")
 if s.query(User).filter_by(email=a.email.lower()).first():raise HTTPException(409,"Email exists")
 u=User(email=a.email.lower(),name=a.name,password_hash=pwd.hash(a.password));s.add(u);s.commit();s.refresh(u);return{"access_token":token(u),"user":{"id":u.id,"email":u.email,"name":u.name,"plan":u.plan}}
@app.post("/api/auth/login")
def login(a:Auth,s:Session=Depends(db)):
 u=s.query(User).filter_by(email=a.email.lower()).first()
 if not u or not pwd.verify(a.password,u.password_hash):raise HTTPException(401,"Incorrect credentials")
 return{"access_token":token(u),"user":{"id":u.id,"email":u.email,"name":u.name,"plan":u.plan}}
@app.get("/api/auth/me")
def authme(u=Depends(me)):return{"id":u.id,"email":u.email,"name":u.name,"plan":u.plan}
@app.get("/api/dashboard")
def dashboard(u=Depends(me),s:Session=Depends(db)):
 x=use(u,s);docs=s.query(Document).filter_by(owner_id=u.id).order_by(Document.created_at.desc()).all();limit=1000 if u.plan=="pro" else 10;mb=10240 if u.plan=="pro" else 100;used=sum(d.size_bytes for d in docs)
 return{"user":{"id":u.id,"email":u.email,"name":u.name,"plan":u.plan},"stats":{"documents":len(docs),"operations":x.operations,"operations_limit":limit,"storage_bytes":used,"storage_limit_bytes":mb*1048576},"recent":[{"id":d.id,"name":d.original_name,"size_bytes":d.size_bytes,"operation":d.operation,"created_at":d.created_at.isoformat()} for d in docs[:10]]}
@app.get("/api/documents")
def docs(u=Depends(me),s:Session=Depends(db)):
 return[{"id":d.id,"name":d.original_name,"size_bytes":d.size_bytes,"operation":d.operation,"created_at":d.created_at.isoformat()} for d in s.query(Document).filter_by(owner_id=u.id).order_by(Document.created_at.desc()).all()]
@app.post("/api/documents/upload")
async def upload(file:UploadFile=File(...),u=Depends(me),s:Session=Depends(db)):
 data=await file.read();x=use(u,s);limit=1000 if u.plan=="pro" else 10;mb=10240 if u.plan=="pro" else 100
 used=sum(d.size_bytes for d in s.query(Document).filter_by(owner_id=u.id).all())
 if x.operations>=limit:raise HTTPException(429,"Monthly limit reached")
 if used+len(data)>mb*1048576:raise HTTPException(413,"Storage limit reached")
 folder=STORE/str(u.id);folder.mkdir(exist_ok=True);name=uuid.uuid4().hex+Path(file.filename or "file.pdf").suffix
 (folder/name).write_bytes(data);d=Document(owner_id=u.id,original_name=file.filename or name,stored_name=name,size_bytes=len(data),mime_type=file.content_type or "application/pdf");s.add(d);x.operations+=1;s.commit();return{"id":d.id}
@app.get("/api/documents/{i}/download")
def download(i:int,u=Depends(me),s:Session=Depends(db)):
 d=s.query(Document).filter_by(id=i,owner_id=u.id).first()
 if not d:raise HTTPException(404,"Not found")
 return FileResponse(STORE/str(u.id)/d.stored_name,filename=d.original_name,media_type=d.mime_type)
@app.delete("/api/documents/{i}")
def delete(i:int,u=Depends(me),s:Session=Depends(db)):
 d=s.query(Document).filter_by(id=i,owner_id=u.id).first()
 if not d:raise HTTPException(404,"Not found")
 p=STORE/str(u.id)/d.stored_name
 if p.exists():p.unlink()
 s.delete(d);s.commit();return{"ok":True}
@app.post("/api/billing/plan")
def plan(p:Plan,u=Depends(me),s:Session=Depends(db)):
 if p.plan not in("free","pro"):raise HTTPException(400,"Invalid plan")
 u.plan=p.plan;s.commit();return{"plan":u.plan}
