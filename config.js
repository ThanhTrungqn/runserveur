// Configuration files
//Configuration serveur MQTT
var host = '192.168.12.23';
var port = 9001;
var topic = 'oyalight/#';
var topic_send_global = 'datapole/global';
var topic_send_environnement = 'datapole/environnement';
var cleansession = true;
var reconnectTimeout = 2000; //every reconnect Timeout 2000 milisecond will reconnect
//Configuration du data Partrimoine
var Client_Id = 1;
var Building_Id = 1;
var Room_Id = 1;

// List result from Application Autoconfig
var listConfigLuminaire = [
	{mac : "06:05:05:01:09:02" , Client_Id : 1 , Building_Id : 1 , room_ID : 1 , PosX : 0  , PosY : 1  , rotation : 0},
	{mac : "06:05:05:01:09:03" , Client_Id : 1 , Building_Id : 1 , room_ID : 1 , PosX : 26  , PosY : 0  , rotation : 0}
];

//Configuration DataParse
var DATAPARSE_MAX_OBJECT =				20;			//255 max object
var DATAPARSE_RADIUS_DEFAULT = 			6;			//pixel
var DATAPARSE_RADIUS_ADD_DIRECTION = 	2;			//pixel
var DATAPARSE_RADIUS_ADD_SPEED = 		1;			//pixel
var DATAPARSE_SPEED_FAST = 				200;		//pixel
var DATAPARSE_PERSON_MOVE_SIZE = 		2;			//pixel
var DATAPARSE_TIME_PERSON_ACTIVE = 		1000;		//miliseconds
var DATAPARSE_TIME_PERSON_INACTIVE = 	2000;		//miliseconds
//Configuration ImageProcessing

//Configuration Tracking
var TRACKING_MAX_OBJECT =				20;			//255 max object
var TRACKING_RADIUS_DEFAULT = 			6;			//pixel
var TRACKING_RADIUS_ADD_DIRECTION = 	2;			//pixel
var TRACKING_RADIUS_ADD_SPEED = 		1;			//pixel
var TRACKING_SPEED_FAST = 				200;		//pixel
var TRACKING_PERSON_MOVE_SIZE = 		2;			//pixel
var TRACKING_TIME_PERSON_ACTIVE = 		1000;		//miliseconds
var TRACKING_TIME_PERSON_INACTIVE = 	2000;		//miliseconds
//Configuration DataSend
var DATASEND_SERVEUR_API = 'https://geo-api.predismart.com/integration-data'; //fournir par DATAPOLE
var DATASEND_KEYWORD_DATA = 'data';					//fournir par DATAPOLE
var DATASEND_KEYWORD_DATATYPE = 'type_data';		//fournir par DATAPOLE
var DATASEND_TIME_ESTATEDATA =			0;			//miliseconds
var DATASEND_TIME_ENVIRONMENT = 		10;			//miliseconds
var DATASEND_TIME_GLOBAL = 				0;			//miliseconds