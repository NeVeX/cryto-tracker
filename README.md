# cryto-tracker
Tracking some crytos


### GQL
* On Windows
  * Use Python 2.7.16
  * Install the windows build tools for couchbase `npm install --global --production windows-build-tools`
  * Use couchbase 2.6 version (not the 3.0 alpha version)
  
### Couchbase
* Install 6.0.0 of the community edition
* Create index on whichever bucket you create `CREATE PRIMARY INDEX ON `bucket-name` USING GSI;`

