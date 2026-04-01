FROM python:3.10
WORKDIR /processor
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . . 

CMD ["uvicorn", "main:processor", "--host", "0.0.0.0", "--port", "8000"]