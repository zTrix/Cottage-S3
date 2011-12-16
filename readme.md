# Cottage-S3 is a S3-like easy-to-use small demo for My SOA course

# Installation and Test

## Dependency

**jdk**, **node** and **redis** is required, please install them first

## Checkout the code

    git clone git://github.com/zTrix/Cottage-S3.git
    cd Cottage-S3
    git submodule update --init

## Run

 - first, start redis. for example: `/etc/init.d/redis start`
 - now cd to `server` dir, type this to run `node server.js`

## Test

We wrote a set of shell script to test the server using `curl`. You can run them in sequence to watch the result.
    
    cd shell-client
    ./index
    ./register
    ./login
    ./upload
    ./space
    ./fetch
    ./remove
    ./space

Almost every shell test script accept command line arguments, such as token, key, file path.  Below shows the useage.

    ./register <email> <password>
    ./login <email> <password>
    ./fetch <key> <file_path> <token>
    ./upload <key> <file_path> <token>
    ./space <token>
    ./remove <key> <token>

 - `key` means the key used to store or fetch file objects
 - `token` means the token returned by `login`, you must provide the token in every account-related api request
 - `file_path` the file path to upload from, or save to for fetch

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

## fetch
**method**: POST

**param**: param should be set in HTTP header

 - token: access token returned by login
 - key: the key to fetch object

**return**: status in HTTP header

 - err:
 - msg: 

**return**: data in HTTP response body

## remove
**method**: POST

**param**: 

 - token: access token returned by login
 - key: the key to remove

**return**:

 - err:
 - msg:
 - space: the space left after remove operation

## space
**method**: POST

**param**:

 - err:
 - msg:
 - space: the space left for this account, in bytes

# Error Code

 - `0` no error
 - `-1` unknown error
 - `-10` internal server error, response code would be 500
 - `-100` invalid param, invalid parameters for api
 - `-101` invalid request

