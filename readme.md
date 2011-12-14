# Cottage-S3 is a S3-like easy-to-use small demo for My SOA course

# API
## register
**method**: POST

**param**:

 - email: register email
 - password: password

**return**:

 - err: error code
 - msg: error msg from server

## login
**method**: POST

**param**:

 - email: 

**return**:

 - err:
 - msg:
 - token: the token to use for later upload or fetch
 - expire: token expire time from now, in seconds

## upload
**method**: POST

**param**: param should be set in HTTP header
 
 - token: access token returned by login
 - key: the key to store the object

**return**:
 
 - err:
 - msg:

# Error Code

 - `0` no error
 - `-1` unknown error
 - `-10` internal server error, response code would be 500
 - `-100` invalid param, invalid parameters for api
 - `-101` invalid request

