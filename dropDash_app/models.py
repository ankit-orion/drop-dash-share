from django.db import models

class upldData(models.Model):
    data=models.FileField(upload_to='docfile/')