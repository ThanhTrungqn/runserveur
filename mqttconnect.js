//*****************************************************************//
var TRACKING_Config =Init_Tracking_Config();
var LABEL_Config;





//Using the HiveMQ public Broker, with a random client Id
var client = new Messaging.Client(host , port, "local_aplication_" + parseInt(Math.random() * 100, 10));

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
var time_send_envrionment = 0;
var listTracking_Old =[];
//Initialize all data and configuration;
var init = DATA_Initialize();
var nb_person=0;
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
		nb_person = TRACKING(listLabelFinalTracking , listTracking , dataIndex , dataTime , TRACKING_Config);
	}
	//console.log (nb_person);
	var dEnd = new Date().getTime();
	showObject();
	draw();
	//This section for send data to the serveur
	getObjectJson();
	if (( dataTime - time_send_envrionment) > 10*1000)
	{
		getEnvironnementJson();
		time_send_envrionment = dataTime;
	}
	//console.log (dEnd - dataTime);
}
function showObject()
{
	var all="";
	for (var i =0 ; i < TRACKING_MAX_OBJECT ; i++)
	{
		var char = "ID " + i + " Size " + listTracking[i].S + " X " + listTracking[i].X + " Y " 
		+ listTracking[i].Y + " fistId  " + listTracking[i].firstUpdateId + " lastId   " + listTracking[i].lastUpdateId 
		+ " dispo   " + listTracking[i].dispo+ " FirstX " + listTracking[i].firstX + " FirstY " + listTracking[i].firstY + " isPeople   " + listTracking[i].isPeople
		+ " isbigPpeople " + listTracking[i].isbigObject + " IDnear " + listTracking[i].listIdNear +'<br>' ;
		all += char;
		
	}
	document.getElementById("demo").innerHTML = all;
	document.getElementById("number").innerHTML = "people "+ nb_person;
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
/***********************************************************************************************/
/***********************************************************************************************/
/***********************************************************************************************/
/***********************************************************************************************/
/***********************************************************************************************/
function getObjectJson()
{
	var all="";
	var addsymbole=false;
	cell_value=0;
	zone_interet_value=0
	all="{\"id\":"+dataIndex+",\"client_id\":"+Client_Id+",\"building_id\":"+Building_Id+",\"room_id\":"+Room_Id+",\"time\":"+dataTime;
	if( nb_person > 0){
		all+=",\"person\":["
		for (var i =0 ; i < TRACKING_MAX_OBJECT ; i++)
		{
			if (listTracking[i].isPeople)
			{
				if (addsymbole)
				{
					all +=",";
				}
				var char = "{\"id\":"+i+",\"size\":"+listTracking[i].S+",\"x\":"+listTracking[i].X+",\"y\":"
				+ listTracking[i].Y+",\"z\":"+ Etage +",\"direction\":"+listTracking[i].direction+",\"speed\":"+listTracking[i].speed
				+",\"firsttime\":"+listTracking[i].firstUpdateTime+",\"lasttime\":"+listTracking[i].lastUpdateTime
				+",\"id_cell\":"+ cell_value
				+"}";
				all += char;
				addsymbole= true;
			}
		}
		all+="]"
	}
	all+="}"
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
	xhr.send("data="+all+"&type_data=global"); 
}
function getEnvironnementJson()
{
	var all="";
	var addsymbole=false;
	all="{\"client_id\":"+Client_Id+",\"building_id\":"+Building_Id+",\"room_id\":"+Room_Id+",\"time\":"+dataTime+",\"data\":["
	for (var i =0 ; i < listConfigLuminaire.length ; i++)
	{
		if ((listsensors[i].sound==0)  
			|| (listsensors[i].temperature==0))
		{
			console.log ("dont send");
			return false;
		}

		if (addsymbole)
		{
			all +=",";
		}
		var char ="{\"id_cell\":"+"\""+listConfigLuminaire[i].id+"\""+ ",\"presence\":"+listsensors[i].presence+",\"luminosity\":"+listsensors[i].luminosity
		+",\"temperature\":"+listsensors[i].temperature+",\"sound\":"+listsensors[i].sound+",\"consumption\":"+listsensors[i].consumption+"}";
		all += char;
		addsymbole= true;
	}
	all+="]}";
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
	xhr.send("data="+all+"&type_data=environment"); 
}
function getEstateJson()
{
	var all="";
	var addsymbole=false;
	var vartime = new Date().getTime();
	all="{\"client_id\":"+Client_Id+",\"building_id\":"+Building_Id+",\"room_id\":"+Room_Id+",\"time\":"+vartime+",\"list_cell\":["
	for (var i =0 ; i < listConfigLuminaire.length ; i++)
	{
		if (addsymbole)
		{
			all +=",";
		}
		var char ="{\"id\":"       + "\"" + listConfigLuminaire[i].id 	+ "\","
				  +"\"firmware\":" + "\"" + Firmware 					+ "\","
				  +"\"mac_eyo\":"  + "\"" + listConfigLuminaire[i].mac 	+ "\","
				  +"\"x\":"			  + listConfigLuminaire[i].PosX + ","
				  +"\"y\":" 			  + listConfigLuminaire[i].PosY + ","
				  +"\"z\":" 			  + Etage 						+ ","
				  +"\"time\":"+dataTime + ","
				  +"\"coordonnees_contour\":["
				  +"{"+'"x":'+listConfigLuminaire[i].PosX+","+'"y":'+listConfigLuminaire[i].PosY+","+'"z":'+Etage+"},"
				  +"{"+'"x":'+(listConfigLuminaire[i].PosX+32)+","+'"y":'+listConfigLuminaire[i].PosY+","+'"z":'+Etage+"},"
				  +"{"+'"x":'+(listConfigLuminaire[i].PosX+32)+","+'"y":'+(listConfigLuminaire[i].PosY+32)+","+'"z":'+Etage+"},"
				  +"{"+'"x":'+listConfigLuminaire[i].PosX+","+'"y":'+(listConfigLuminaire[i].PosY+32)+","+'"z":'+Etage+"}"+"],"
				  +"\"rotation\":"+ 0 + ","
				  //+"list_zone_interet:"
				  //{ "id": "zone_interet_1", // internal GEO identifier 
    				//"objet_id": 1, // internal GEO identifier 
    				//"ref_point": {"x": val_x, "y": val_y, "z": val_z},            
    				//"coordonnees_contour" : [ 
        			//{"x": val_x, "y": val_y, "z": val_z}],}
				  +'"list_capteurs":'
				  +'[{"id":"capteur_1","name":"SENSE1","type":"thermique"},'
				  +'{"id":"capteur_2","name":"SENSE2","type":"sound"},'
				  +'{"id":"capteur_3","name":"SENSE3","type":"luminosity"}]'
				  +"}";
		all += char;
		addsymbole= true;
	}
	all +="]";
	//all +="\"list_objects\":[],"+"\"list_button\":[],"+"\"tracking_config\":{}}";
	all +=",\"tracking_config\":{"
		+'"tracking_max_object":5,'
        +'"tracking_radius_default":6,'
        +'"tracking_radius_add_direction":2,'
        +'"tracking_radius_add_speed":1,'
        +'"tracking_speed_fast":200,'
        +'"tracking_person_move_size":2,'
        +'"tracking_time_person_active":1000,'
        +'"tracking_time_person_inactive":2000'
        +"}"
	all +="}";
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