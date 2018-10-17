//This file will contien all function for initialized this system
var INIT_ZONE_ACTIVE_MATRIX=[];
var INIT_MATRIX=[];
var INIT_MATRIX_BORD_IN=[];
var INIT_MATRIX_BORD_OUT=[];
var INIT_MATRIX_HEIGHT=0;
var INIT_MATRIX_WIDTH=0;
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
	var obSensors = { mac : 0,ip : 0, luminosity : 0, sound : 0, comsumption : 0 , temperature : 0, presence :0};
	for (var i = 0; i < listConfigLuminaire.length ; i++){
		listLabelling[i] =[];
		listsensors[i]=obSensors;
	}
	getEstateJson();
	Init_Create_Matrix(listConfigLuminaire);
	Init_Create_Zone_Active_Matrix (listConfigLuminaire);
	console.log(INIT_ZONE_ACTIVE_MATRIX);
	return true;
}
var INIT_ZONE_ACTIVE_MATRIX=[];
var INIT_MATRIX=[];
var INIT_MATRIX_HEIGHT=0;
var INIT_MATRIX_WIDTH=0;
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