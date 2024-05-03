from django.shortcuts import render, redirect
from django.core.files.storage import FileSystemStorage
from django.contrib import messages
from django.conf import settings
import os
import uuid
import datetime
from azure.storage.blob import BlobServiceClient, BlobSasPermissions, generate_blob_sas


connection_string = settings.CONNECTION_STRING
container_name = settings.CONTAINER_NAME
custom_domain = settings.CUSTOM_DOMAIN
    
blob_service_client = BlobServiceClient.from_connection_string(connection_string)

def home(request):
    if request.method == "POST" and request.FILES['savefile']:
        fileP = request.FILES['savefile']
        unique_filename = str(uuid.uuid4()) + os.path.splitext(fileP.name)[1]

        # Upload the file to Azure Blob Storage
        blob_client = blob_service_client.get_blob_client(container=container_name, blob=unique_filename)
        with fileP.open() as data:
            blob_client.upload_blob(data)

        # Generate SAS URL for the uploaded file
        sas_token = generate_blob_sas(
            account_name=blob_service_client.account_name,
            container_name=container_name,
            blob_name=unique_filename,
            account_key=blob_service_client.credential.account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Set expiry time
        )
        sas_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_name}/{unique_filename}?{sas_token}"

        messages.success(request, 'File Uploaded Successfully!')
        return render(request, 'core/home.html', {'uploaded_url': sas_url})
    

    return render(request, 'core/home.html')
