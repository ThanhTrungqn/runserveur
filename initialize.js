//Configuration for Tracking
var TRACKING_MAX_OBJECT 			=	20;			//255 max object

var TRACKING_RADIUS_DEFAULT 		=	10;			//pixel
var TRACKING_RADIUS_DEFAULT_1 		=	4;
var TRACKING_RADIUS_DEFAULT_2 		=	8;
var TRACKING_RADIUS_DEFAULT_3 		=	12;
var TRACKING_RADIUS_DEFAULT_4 		=	13;

var TRACKING_RADIUS_ADD_DIRECTION 	= 	2;			//Tăng thêm radius size nếu cùng speed
var TRACKING_RADIUS_ADD_SPEED 		=	1;			//Tăng thêm radius size nếu cùng direction
var TRACKING_SPEED_FAST 			=	200;		//Nếu tốc độ > TRACKING_SPEED_FAST => người này đang đi nhanh
var TRACKING_SPEED_MOYEN 			=	100;
var TRACKING_PERSON_MOVE_SIZE 		=	2;			//Nếu người đang di chuyển dùng để xác định hướng
var TRACKING_TIME_PERSON_ACTIVE 	=	1000;		//thời gian active của 1 người
var TRACKING_TIME_PERSON_INACTIVE 	= 	3000;		//thời gian inactive của 1 người
var TRACKING_PEOPLE_DISTANCE 		=	25;			//If distance of this personne mouve to 50 will considered 1 person

//Configuration for LABEL
var LABEL_BORDSIZE 					= 4;
var LABEL_BORDADD 					= 3;
var LABEL_IMAGEHEIGHT 				= 32;
var LABEL_IMAGEWIDTH 				= 32;
//Configuration for DATASEND
var DATASEND_SERVEUR_API 			=  'https://geo-api.predismart.com/integration-data'; 	//fournir par DATAPOLE
var DATASEND_KEYWORD_DATA 			=  'data';												//fournir par DATAPOLE
var DATASEND_KEYWORD_DATATYPE 		=  'type_data';											//fournir par DATAPOLE
var DATASEND_KEYWORD_ESTATE 		=  'estate';											//fournir par DATAPOLE
var DATASEND_KEYWORD_GLOBAL 		=  'global';											//fournir par DATAPOLE
var DATASEND_KEYWORD_ENVIRONMENT 	=  'environment';										//fournir par DATAPOLE
var DATASEND_TIME_ESTATEDATA 		=	0;			//seconds
var DATASEND_TIME_ENVIRONMENT 		=	10;			//seconds
var DATASEND_TIME_GLOBAL 			=	0;			//seconds

//This file will contien all function for initialized this system
var INIT_ZONE_ACTIVE_MATRIX=[];
var INIT_MATRIX=[];
var INIT_MATRIX_BORD_IN=[];
var INIT_MATRIX_BORD_OUT=[];
var INIT_MATRIX_HEIGHT=0;
var INIT_MATRIX_WIDTH=0;

var INIT_ZONE_ACTIVE_MATRIX=[];
var INIT_MATRIX=[];
var INIT_MATRIX_HEIGHT=0;
var INIT_MATRIX_WIDTH=0;

var listTracking_history = [];


function DATA_Initialize(){
	dataIndex = 0;
	dataTime = 0;
	//Initializing list Tracking
	var listNull=[];
	for (var i = 0 ; i < TRACKING_MAX_OBJECT ; i ++)
	{
		var person= {
			id:i,
			X:0,
			Y:0,
			S:0,
			isPeople:false,
			move:false,
			firstUpdateId:0,
			firstUpdateTime:0,
			direction:0,
			speed:0,
			lastUpdateId:0,
			lastUpdateTime:0,
			dispo:true,
			firstX:0,
			firstY:0,
			id_label:0,
			listIdbigObject:listNull,
			isbigObject:0,
			listIdNear:listNull
		};
		listTracking.push(person);
	}
	//Initializing listTracking_Old
	for (var i = 0 ; i < TRACKING_MAX_OBJECT ; i ++)
	{
		var person= {
			id:i,
			X:0,
			Y:0,
			S:0,
			isPeople:false,
			move:false,
			firstUpdateId:0,
			firstUpdateTime:0,
			direction:0,
			speed:0,
			lastUpdateId:0,
			lastUpdateTime:0,
			dispo:true,
			firstX:0,
			firstY:0,
			id_label:0,
			listIdbigObject:listNull,
			isbigObject:0,
			listIdNear:listNull
		};
		listTracking_Old.push(person);
	}
	//Initializing list Label
	var obSensors = { mac : 0, ip : 0, luminosity : 0, sound : 0, consumption : 0 , temperature : 0, presence :0};
	for (var i = 0; i < listConfigLuminaire.length ; i++){
		listLabelling[i] =[];
		listsensors[i]=obSensors;
	}
	getEstateJson();
	Init_Create_Matrix(listConfigLuminaire);
	Init_Create_Zone_Active_Matrix (listConfigLuminaire);
	console.log(INIT_ZONE_ACTIVE_MATRIX);

	//Initializing Canvas
	return true;
}

function Init_Tracking_Config (){
	var TRACKING_Config = {
		max_object 				: TRACKING_MAX_OBJECT,			//255 max object
		radius_default 			: TRACKING_RADIUS_DEFAULT,
		radius_default_1 		: TRACKING_RADIUS_DEFAULT_1,
		radius_default_2 		: TRACKING_RADIUS_DEFAULT_2,
		radius_default_3 		: TRACKING_RADIUS_DEFAULT_3,
		radius_default_4 		: TRACKING_RADIUS_DEFAULT_4,
		radius_add_direction 	: TRACKING_RADIUS_ADD_DIRECTION,
		radius_add_speed 		: TRACKING_RADIUS_ADD_SPEED,
		radius_speed_fast 		: TRACKING_SPEED_FAST,
		radius_speed_moyen		: TRACKING_SPEED_MOYEN,
		person_move_size        : TRACKING_PERSON_MOVE_SIZE,
		time_person_active 		: TRACKING_TIME_PERSON_ACTIVE,
		time_person_inactive    : TRACKING_TIME_PERSON_INACTIVE,
		people_distance 		: TRACKING_PEOPLE_DISTANCE
	}
	return TRACKING_Config;
}

function Init_Label_Config (){
	var LABEL_Config = {

	}
	return LABEL_Config;
}
function Init_Datasend_Config (){
	var DATASEND_Config = {
		serveur_api 			: DATASEND_SERVEUR_API,
		keyword_data 			: DATASEND_KEYWORD_DATA,
		keyword_datatype 		: DATASEND_KEYWORD_DATATYPE,
		keyword_estate 			: DATASEND_KEYWORD_ESTATE,
		keyword_global 			: DATASEND_KEYWORD_GLOBAL,
		keyword_environment 	: DATASEND_KEYWORD_ENVIRONMENT,
		time_estate_data  		: DATASEND_TIME_ESTATE_DATA,
		time_environment_data 	: DATASEND_TIME_ENVIRONMENT_DATA,
		time_global_data 		: DATASEND_TIME_GLOBAL_DATA
	}
	return DATASEND_Config;
}

function Init_Create_Matrix(listConfigLuminaire){
	//Step 1: definde max and min of position
	var minX = 100;
	var maxX = -100;
	var minY = 100;
	var maxY= -100;
	for (var i = 0 ;  i < listConfigLuminaire.length ; i ++ )
	{
		if (listConfigLuminaire[i].PosX < minX ){
			//Update minX
			minX = listConfigLuminaire[i].PosX;
		}
		if (listConfigLuminaire[i].PosX > maxX ){
			//Update maxX
			maxX = listConfigLuminaire[i].PosX;
		}
		if (listConfigLuminaire[i].PosY < minY ){
			//Update minY
			minY = listConfigLuminaire[i].PosY;
		}
		if (listConfigLuminaire[i].PosY > maxY ){
			//Update maxY
			maxY = listConfigLuminaire[i].PosY;
		}
	}
	var heightM=(maxY-minY+32);
	var widthM=(maxX-minX+32);
	//Step 2 :  Init table with size;
	for (var i = 0 ;  i < (maxX-minX+32)*(maxY-minY+32) ; i ++ )
	{
		INIT_MATRIX.push(0);
	}
	for (var i = 0 ;  i < listConfigLuminaire.length ; i ++ )
	{
		for (var heightY = 0 ;  heightY < 32 ; heightY ++ ){
			for (var widthX = 0 ;  widthX < 32 ; widthX ++ ){
				var pos =  (listConfigLuminaire[i].PosY +heightY ) * widthM + (listConfigLuminaire[i].PosX + widthX);
				INIT_MATRIX[pos] +=1 ;
			}
		}
	}
	INIT_MATRIX_HEIGHT=heightM;
	INIT_MATRIX_WIDTH=widthM;
}
function Init_Create_Zone_Active_Matrix (listConfigLuminaire){
	var heightM=INIT_MATRIX_HEIGHT;
	var widthM=INIT_MATRIX_WIDTH;
	for (var i = 0 ;  i < heightM*widthM ; i ++ )
	{
		INIT_ZONE_ACTIVE_MATRIX.push(0);
		INIT_MATRIX_BORD_IN.push(0);
		INIT_MATRIX_BORD_OUT.push(0);
	}
	for (var i = 0 ;  i < listConfigLuminaire.length ; i ++ )
	{
		for (var heightY = 0 ;  heightY < 32 ; heightY ++ ){
			for (var widthX = 0 ;  widthX < 32 ; widthX ++ ){
				var pos =  (listConfigLuminaire[i].PosY +heightY ) * widthM + (listConfigLuminaire[i].PosX + widthX);
				INIT_ZONE_ACTIVE_MATRIX[pos] = i +1;
			}
		}
	}
}