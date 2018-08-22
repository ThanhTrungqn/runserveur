//*****************************************************************//
var TRACKING_RADIUS_DEFAULT = 6;
var TRACKING_RADIUS_ADD_DIRECTION = 2;
var TRACKING_RADIUS_ADD_SPEED = 1;
var TRACKING_SPEED_FAST = 200;
var TRACKING_SPEED_MOYEN = 100;
//Using the HiveMQ public Broker, with a random client Id
var client = new Messaging.Client(host , port, "myclientid_" + parseInt(Math.random() * 100, 10));
//*****************************************************************//
//*************CODE FOR MQTT CLIENT, DONT CHANGE PLS***************//
//*****************************************************************//
//Gets called if the websocket/mqtt connection gets disconnected for any reason
client.onConnectionLost = function (responseObject) {	
	//setTimeout(client.connect(options), reconnectTimeout);
	//client.connect(options);
};
//Connect Options
var options = {
				timeout: 30,
				cleanSession: cleansession,
				 //Gets Called if the connection has sucessfully been established
				onSuccess: function () {
					 client.subscribe(topic,{qos: 1}); 
				},
				 //Gets Called if the connection could not be established
				onFailure: function (message) {
				}
};
client.connect(options);
//Creates a new Messaging.Message Object and sends it to the HiveMQ MQTT Broker
function publish (payload, topic, qos) {
	//Send your message (also possible to serialize it as JSON or protobuf or just use a string, no limitations)
	var message = new Messaging.Message(payload);
	message.destinationName = topic;
	message.qos = qos;
	client.send(message);
}
/*******************************************************************/
//*****************************************************************//
//*************CODE FOR MQTT PROCESS*******************************//
//*****************************************************************//
//CONFIGURATION list luminaire
var listLuminaire = [];
var objectLuminaire = [];
var listTracking = [];
var listLabelling = [];
var listsensors = [];
var listLabelFinalTracking = [];
var dataIndex, dataTime;
//Initialize all data and configuration;
var init = DATA_Initialize();

//Gets called whenever you receive a message for your subscriptions
client.onMessageArrived = function (message) {
	dataTime = new Date().getTime();		//Get time before processing
	var mac, id ,ip , presence, listLabel , result;	//declare variable
	var luminosity, sound, consumption , temperature, presence;
	var list_new;									//declare variable

	//Step 1: get data
	[result , mac , id ,ip ,presence, listLabel, luminosity, sound, consumption , temperature, presence] = parseJson(message);
	//Step 2: check valide data
	if (result && (id >= 0))
	{
		//update sensors environnement
		listsensors[id] = dataSensors ( mac, ip, luminosity, sound, consumption , temperature, presence);

		dataIndex++;		//update dataIndex
		//Step 3: Convert data => result : listLabelling;
		[result, list_new ]= dataConvert(listLabel , id);
		listLabelling[id] = list_new;

		//Step 4: Update list data => result list_label_final
		listLabelFinalTracking = Labeling(listLabelling);
		//Todo: fiabilite cet partie

		//Step 5: Tracking listLabelFinalTracking
		var nb_person = TRACKING(listLabelFinalTracking , listTracking , dataIndex , dataTime);
	}
	//console.log (nb_person);
	var dEnd = new Date().getTime();
	showObject();
	//getObjectJson();
	//getEnvironnementJson();
	//getEstateJson();
	//console.log (dEnd - dataTime);
}
function showObject()
{
	var all="";
	for (var i =0 ; i < TRACKING_MAX_OBJECT ; i++)
	{
		var char = "ID " + i + " Size " + listTracking[i].S + " X " + listTracking[i].X + " Y " 
		+ listTracking[i].Y + " fistId  " + listTracking[i].firstUpdateId + " lastId   " + listTracking[i].lastUpdateId 
		+ " dispo   " + listTracking[i].dispo + " isPeople   " + listTracking[i].isPeople +'<br>' ;
		all += char;
	}
	document.getElementById("demo").innerHTML = all;
}
/**************************************************************************/
function Labeling(listLabelling) {
	var listLabelFinal = [];
	// body....
	for (var i = 0; i < listLabelling.length ; i++) {
		//console.log(listLabelling[i]);
		for (var j = 0; j < listLabelling[i].length ; j++) {
			//Verify if in list?
			var exist =  false;
			for (var k = 0; k < listLabelFinal.length ; k++) {
				if ( checkDoubleLabel (listLabelling[i][j] , listLabelFinal[k]))
				{
					//function checking;
					exist = true;
					//found => update Label vaf thoat khoi chuong trinh
					listLabelFinal[k] = updateLabel(listLabelling[i][j] , listLabelFinal[k]);
					break;
				}
			}
			//Add in list
			if (exist == false)
			{
				//listLabelFinal[listLabelFinal.length] = listLabelling[i][j];
				listLabelFinal.push(listLabelling[i][j]);
			}
		}
	}
	//verify listLabelFinal
	//check if existe label in valide bord?  if not delete Label;
	//for (var i = 0 ; i < listLabelFinal.length ; i++) {
	//	if ((listLabelFinal[i].S <20)&&(listLabelFinal[i].))
	//}
	return listLabelFinal;
}
/**************************************************************************/

//direction 0 -> 8 immobile , top, top +right,...
function searchPeople ( tLabel , listTracking ){
	var thight ,_width ,_hight ,width;
	for (var j = 0 ; j < listTracking.length ; j++ )
	{
		//calculate size Radius
		[hight , _hight, width , _width] = calculateRadius (listTracking[i].direction , listTracking[i].speed);
		var difX = listTracking[i].X - tLabel.X;
		var difY = listTracking[i].Y - tLabel.Y;
		//check if valide => update tableau
	}
	//when list done; check status candidautre
	return tableau;
}
function DATA_Initialize(){
	dataIndex = 0;
	dataTime = 0;
	//Initializing list Tracking
	for (var i = 0 ; i < TRACKING_MAX_OBJECT ; i ++)
	{
		var person= {id:i,X:0,Y:0,S:0,isPeople:false,firstUpdateId:0,firstUpdateTime:0,direction:0,speed:0,direction:0,speed:0,lastUpdateId:0,lastUpdateTime:0,dispo:true};
		listTracking.push(person);
	}
	//Initializing list Label
	var obSensors = { mac : 0,ip : 0, luminosity : 0, sound : 0, comsumption : 0 , temperature : 0, presence :0};
	for (var i = 0; i < listConfigLuminaire.length ; i++){
		listLabelling[i] =[];
		listsensors[i]=obSensors;
	}
	return true;
} 
/***********************************************************************************************/
/***********************************************************************************************/
/***********************************************************************************************/
/***********************************************************************************************/
/***********************************************************************************************/
function getObjectJson()
{
	var all="";
	var addsymbole=false;
	all="{\"id\":"+dataIndex+",\"Client_Id\":"+Client_Id+",\"Building_Id\":"+Building_Id+",\"Room_Id\":"+Room_Id+",\"time\":"+dataTime+",\"person\":["
	for (var i =0 ; i < TRACKING_MAX_OBJECT ; i++)
	{
		if ((listTracking[i].dispo == false)&&((listTracking[i].lastUpdateTime - listTracking[i].fistUpdateTime)>=2000))
		{
			if (addsymbole)
			{
				all +=",";
			}
			var char = "{\"ID\":"+i+",\"Size\":"+listTracking[i].S+",\"X\":"+listTracking[i].X+",\"Y\":"
			+ listTracking[i].Y +",\"Direction\":"+listTracking[i].direction+",\"Speed\":"+listTracking[i].speed
			+",\"FirstTime\":"+listTracking[i].firstUpdateTime+",\"LastTime\":"+listTracking[i].lastUpdateTime+"}";
			all += char;
			addsymbole= true;
		}
	}
	all+="]}"
	var xhr = new XMLHttpRequest();
	xhr.open("POST", 'https://geo-api.predismart.com/integration-data', true);

	//Send the proper header information along with the request
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	xhr.onreadystatechange = function() {//Call a function when the state changes.
    	if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        	// Request finished. Do processing here.
    	}
	}
	xhr.send("data="+all+"&type_data=global"); 
}
function getEnvironnementJson()
{
	var all="";
	var addsymbole=false;
	all="{\"id\":"+dataIndex+",\"Client_Id\":"+Client_Id+",\"Building_Id\":"+Building_Id+",\"Room_Id\":"+Room_Id+",\"time\":"+dataTime+",\"listLuminaire\":["
	for (var i =0 ; i < listConfigLuminaire.length ; i++)
	{
		if (addsymbole)
		{
			all +=",";
		}
		var char ="{\"mac\":"+listsensors[i].mac+ ",\"sensors\":{\"presence\":"+listsensors[i].presence+",\"luminosity\":"+listsensors[i].luminosity
		+",\"temperature\":"+listsensors[i].temperature+",\"sound\":"+listsensors[i].sound+",\"consumption\":"+listsensors[i].consumption+"}}";
		all += char;
		addsymbole= true;
	}
	all+="]}"
	var xhr = new XMLHttpRequest();
	xhr.open("POST", 'https://geo-api.predismart.com/integration-data', true);
	//Send the proper header information along with the request
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {//Call a function when the state changes.
    	if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        	// Request finished. Do processing here.
    	}
	}
	xhr.send("data="+all+"&type_data=envrironment"); 
}
function getEstateJson()
{
	var all="";
	var addsymbole=false;
	all="{\"id\":"+dataIndex+",\"Client_Id\":"+Client_Id+",\"Building_Id\":"+Building_Id+",\"Room_Id\":"+Room_Id+",\"listConfigLuminaire\":["
	for (var i =0 ; i < listConfigLuminaire.length ; i++)
	{
		if (addsymbole)
		{
			all +=",";
		}
		var char ="{\"mac\":"+"\""+listConfigLuminaire[i].mac+"\""+",\"PosX\":"+listConfigLuminaire[i].PosX+",\"PosY\":"+listConfigLuminaire[i].PosY
		+",\"rotation\":"+listConfigLuminaire[i].rotation+"}";
		all += char;
		addsymbole= true;
	}
	all+="]}"
	console.log(all);
	//publish (all, topic_send_environnement , 0);
	var xhr = new XMLHttpRequest();
	xhr.open("POST", 'https://geo-api.predismart.com/integration-data', true);
	//Send the proper header information along with the request
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange = function() {//Call a function when the state changes.
    	if(this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        	// Request finished. Do processing here.
    	}
	}
	console.log(all);
	xhr.send("data="+all+"&type_data=estate"); 
}