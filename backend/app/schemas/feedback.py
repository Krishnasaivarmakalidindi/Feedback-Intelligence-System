from pydantic import BaseModel, EmailStr


class FeedbackCreate(BaseModel):
    customer_name: str
    email: EmailStr
    message: str 

