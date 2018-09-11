//This script, do the funtion data processing before;
//function take object
var BORDSIZE = 4;
var BORDADD = 3;
var IMAGEHEIGHT = 32;
var IMAGEWIDTH = 32;

function parseJson(message) {
	var listobjet = [];
	var payload = message.payloadString;
	var idLuminaire = -1;
	payload.replace(/.$/,"}");
	//kiểm tra có valide json không
	//nếu đúng //lây Mac , Ip , presence, list_object;
	try {

		var json = JSON.parse(payload);
		var json_mac = json.luminaire.mac;
		for ( var i = 0 ; i < listConfigLuminaire.length ; i++)
		{ 
			if (listConfigLuminaire[i].mac == json_mac ){
				idLuminaire = i;
				break;
			}
		}
		var json_ip  = json.luminaire.ip;
		var json_presence    = json.luminaire.sensors.presence;
		var json_tlabel = json.luminaire.sensors.tLabel;
		var json_luminosity = json.luminaire.sensors.luminosity;
		var json_sound = json.luminaire.sensors.sound_level;
		var json_consumption = json.luminaire.sensors.consumption;
		var json_temperature = json.luminaire.sensors.temperature;
		var json_presence = json.luminaire.sensors.presence;
		var result = true;
		//console.log (json_mac);
		//if (json_tlabel.length >= 1)
		//{
		//	console.log(json_tlabel[0].size);
		//	console.log (json_tlabel[0]);
		//}
		return [result, json_mac, idLuminaire, json_ip, json_presence, json_tlabel , json_luminosity,json_sound,json_consumption,json_temperature,json_presence];
	} catch (e) {
		var result = false;
		return [result, json_mac, idLuminaire, json_ip, json_presence, json_tlabel , json_luminosity,json_sound,json_consumption,json_temperature,json_presence];
	}
}
function dataSensors ( json_mac, json_ip, json_luminosity, json_sound, json_consumption , json_temperature, json_presence)
{
	var obLabel = { mac : "\""+json_mac+"\"",ip : json_ip, luminosity : json_luminosity, sound : json_sound, consumption : json_consumption , temperature : json_temperature, presence :json_presence};
	return obLabel;
}
function dataConvert (listLabel , idLuminaire ) {
	var new_listLabel=[];
	if ( idLuminaire >= 0)
	{
		var lumPosX = listConfigLuminaire[idLuminaire].PosX;
		var lumPosY = listConfigLuminaire[idLuminaire].PosY;
		for ( var i = 0 ; i < listLabel.length ; i++)
		{
			var s = listLabel[i].size;
			var t = listLabel[i].t + lumPosY;
			var b = listLabel[i].b + lumPosY;
			var l = listLabel[i].l + lumPosX;
			var r = listLabel[i].r + lumPosX;

			//here update function deteriner bord
			//reupdate top bottom left right if object near bord
			var tBord = false, bBord = false, lBord = false, rBord = false;
			var sizegrandir = 6;
			if (s <=10 )
			{
				sizegrandir = 8;
			}
			if ( listLabel[i].t <= BORDSIZE )
			{
				tBord = true;
				if (s <=20)
				{
					if (t >=sizegrandir){
						t -=sizegrandir;
					}
					else
					{	
						t = 0;
					}
				}
			}
			if ( listLabel[i].b >= (IMAGEHEIGHT - BORDSIZE))
			{
				bBord = true;
				if (s <=20)
				{
					b +=sizegrandir;
				}
			}
			if ( listLabel[i].l <= BORDSIZE)
			{
				lBord = true;
				if (s <=20)
				{
					if (l >=sizegrandir){
						l -=sizegrandir;
					}
					else
					{
						l = 0;
					}
				}
			}
			if ( listLabel[i].r >= (IMAGEHEIGHT - BORDSIZE))
			{
				rBord = true;
				if (s <=20)
				{
					r +=sizegrandir;
				}
			}
			var x = (l + r)/2;
			var y = (t + b)/2;
			var id = [idLuminaire];
			var obLabel = { idLum : id, S : s, X : x, Y : y, T : t, B :b, L :l, R : r, 
					TOPBORD : tBord, BOTTOMBORD : bBord, LEFTBORD : lBord, RIGHTBORD : rBord , updated : false , tUpdated : false};
			new_listLabel.push(obLabel);
		}
		return [ true , new_listLabel];
	}
	else
	{
		return [ false , new_listLabel];
	}
}

//this function willl return true if this Label existe
function checkDoubleLabel ( tLabel1 , tLabel2 ) {
	//check if 2 label normal ou 1 label petit
	var difX = tLabel1.X - tLabel2.X;
	var difY = tLabel1.Y - tLabel2.Y;
	var height=3;
	var width=3;
	//var height = (tLabel1.B + tLabel2.B - tLabel1.T - tLabel2.T)/2;
	//var width =  (tLabel1.R + tLabel2.R - tLabel1.L - tLabel2.L)/2;
	if (difX < 0){
		difX = -difX;
	}
	if (difY < 0){
		difY = -difY;
	}
	if (( difX <= width ) && ( difY <= height))
	{
		return true;
	}
	else if ( difY <= height)
	{
		if ((tLabel1.LEFTBORD && tLabel2.RIGHTBORD) 
			||(tLabel1.RIGHTBORD && tLabel2.LEFTBORD))
		{
			return true;
		}
	}
	else if ( difX <= width )
	{
		if ((tLabel1.TOPBORD && tLabel2.BOTTOMBORD) 
			||(tLabel1.BOTTOMBORD && tLabel2.TOPBORD))
		{
			return true;
		}
	}
	return false;
}
//this function update 2 label
function checkDoubleBordLabel ( tLabel1 , listLabel ){
	//neu nhu size nho, va gan 1 cai bord nao do
	//=> check trong list luminaire ben kia
	//verify if BordLabel
	if  (tLabel1.S < 20)
	{ 
		if ( tLabel1.BOTTOMBORD || tLabel1.TOPBORD || tLabel1.LEFTBORD || tLabel1.RIGHTBORD )
		{
			for (var i =0 ; i < listLabel.length ; i ++ )
			{
				if (tLabel1.BOTTOMBORD)
				{

				}
				if (tLabel1.TOPBORD)
				{

				}
				if (tLabel1.LEFTBORD)
				{

				}
				if (tLabel1.RIGHTBORD)
				{

				}

			}
		}
	}
	return false;
}

function updateLabel ( tLabel1 , tLabel2 ) {
	var s = max (tLabel1.S ,tLabel2.S);
	var t = min (tLabel1.T ,tLabel2.T);
	var b = max (tLabel1.B ,tLabel2.B);
	var l = min (tLabel1.L ,tLabel2.L);
	var r = max (tLabel1.R ,tLabel2.R);
	//here update function deteriner bord
	//reupdate top bottom left right if object near bord
	var tBord = false, bBord = false, lBord = false, rBord = false;
	var id1 = tLabel1.idLum;
	var id2 = tLabel2.idLum;
	var idLuminaire = id1.concat(id2);
	var x = (l + r)/2;
	var y = (t + b)/2;
	var obLabel = { idLum : idLuminaire, S : s, X : x, Y : y, T : t, B :b, L :l, R : r, 
					TOPBORD : tBord, BOTTOMBORD : bBord, LEFTBORD : lBord, RIGHTBORD : rBord , updated : false, tUpdated : false};
	return obLabel;
}
/****ZONE FOR TOOL MATH****************************************************/
function max(a ,b){
	if ( a >= b)
	{
		return a;
	}
	else
	{
		return b;
	}
}
function min(a ,b){
	if ( a >= b)
	{
		return b;
	}
	else
	{
		return a;
	}
}