//here zone for stepe Tracking; all algorthime for tracking in this script
//and all configuration in the config file
/*****************************************************************/
//2 variable global
//var listTracking = [];			//list object tracking
//var listLabelFinalTracking = [];	//list label need tracking
var listStateLabel = [];

function TRACKING(listLabel , listTracking , dataIndex , dataTime){
	var nbrNewUpdate = 0;
	var nbrOldUpdate = 0;
	var nbrOldPeople = 0;
	listStateLabel = [];
	//Init list StateLabel
	for (var i = 0 ; i < listLabel.length ; i++)
	{
		var obj = {tUpdated : false};
		listStateLabel.push(obj);
	}
	var listTrackingResult=[];
	var list_updated=[];
	//Step 1 : first loop cập nhật vật 100%
	for (var i = 0; i < listLabel.length ; i++){
		//console.log("Label "+i);
		if (listStateLabel[i].tUpdated == false) 
		{
			var tLabel = listLabel[i];
			var list_updated, type1 , type2, type3;
			[list_updated , type3 , type2 , type1]= TRACKING_SearchPeople( listLabel[i] , listTracking ,dataIndex , dataTime , false); //update xong list
			if (type3 == 1)
			{
				console.log ("go here 111");
				var idObject = -1;
				for (var j = 0; j < list_updated.length ; j++ ){
					if (list_updated[j].value ==3)
					{
						idObject = list_updated[j].id;
						break;
					}
				}
				//Update
				var newObject = false;
				TRACKING_UpdatedLabel(i,listLabel);
				TRACKING_UpdateObject (newObject , idObject , tLabel , dataIndex , dataTime );
			}
		}
	}
	//Step 2 : second loop Cập nhật vật 75%
	for (var i = 0; i < listLabel.length ; i++){
		if (listStateLabel[i].tUpdated == false) 
		{
			var tLabel = listLabel[i];
			var list_updated, type1 , type2, type3;
			[list_updated , type3 , type2 , type1]= TRACKING_SearchPeople( listLabel[i] , listTracking ,dataIndex , dataTime , false); //update xong list
			if (type3 == 1)
			{
				console.log ("go here 222");
				var idObject = -1;
				for (var j = 0; j < list_updated.length ; j++ ){
					if (list_updated[j].value ==3)
					{
						idObject = list_updated[j].id;
						break;
					}
				}
				//Update
				var newObject = false;
				TRACKING_UpdatedLabel(i,listLabel);
				TRACKING_UpdateObject (newObject , idObject , tLabel , dataIndex , dataTime );
			}
			else if (type2 ==1)
			{
				console.log ("go here 333");
				var idObject = -1;
				for (var j = 0; j < list_updated.length ; j++ ){
					if (list_updated[j].value == 2)
					{
						idObject = list_updated[j].id;
						break;
					}
				}
				//Update
				var newObject = false;
				TRACKING_UpdatedLabel(i,listLabel);
				TRACKING_UpdateObject (newObject , idObject , tLabel , dataIndex , dataTime );
			}
		}
	}
	//Step 3 : third loop cập nhật vật nhỏ duy nhất còn sót lại
	for (var i = 0; i < listLabel.length ; i++){
		if (listStateLabel[i].tUpdated == false) 
		{
			var tLabel = listLabel[i];
			var list_updated, type1 , type2, type3;
			[list_updated , type3 , type2 , type1]=TRACKING_SearchPeople( listLabel[i] , listTracking ,dataIndex , dataTime , false); //update xong list
			if (list_updated.length == 1)
			{
				console.log ("go here 444");
				var idObject = list_updated[0].id;
				//Update
				var newObject = false;
				TRACKING_UpdatedLabel(i,listLabel);
				TRACKING_UpdateObject (newObject, idObject, tLabel, dataIndex, dataTime);
			}
		}
	}
	//Step 4 : forth loop cập nhật vật to
	for (var i = 0; i < listLabel.length ; i++){
		if (listStateLabel[i].tUpdated == false) 
		{
			var tLabel = listLabel[i];
			var list_updated, type1 , type2, type3;
			[list_updated , type3 , type2 , type1]=TRACKING_SearchPeople( listLabel[i] , listTracking ,dataIndex , dataTime , true); //update xong list
			var updatedLabel = false;
			if (list_updated.length >= 1 )
			{
				console.log ("go here 555");
				updatedLabel = true;
				for (var j = 0; j < list_updated.length ; j++ ){
					var idObject = list_updated[j].id;
					//điều kiện ràng buộc
					var newObject = false;
					TRACKING_UpdateObject (newObject, idObject, tLabel, dataIndex, dataTime);
				}
			}
			if (updatedLabel)
			{
				TRACKING_UpdatedLabel(i,listLabel);
			}
		}
	}
	//Step 5 : các vật còn sót lại
	for (var i = 0; i < listLabel.length ; i++){
		if (listStateLabel[i].tUpdated == false) 
		{
			console.log("go here 666");
			var tLabel = listLabel[i];
			var newObject = true;
			var idObject = TRACKING_FindIdObjectFree();
			TRACKING_UpdateObject (newObject, idObject, tLabel, dataIndex, dataTime);
			TRACKING_UpdatedLabel(i,listLabel);
		}
	}
	//Step 6 : decide nombre de person
	var count = TRACKING_DecidePerson(dataIndex);
	console.log ("nombre "+count);
	//Step 7 : Update listTracking
	TRACKING_UpdateObjectFree(dataIndex);
}

function TRACKING_DecidePerson(index){
	//nếu vật xuất hiện thường xuyên
	//nếu trong 1 phút vật có di chuyển
	//vật xuất hiện ở đâu
	var count = 0;
	for (var i = 0 ; i < listTracking.length ; i++ ){
		//tính theo thời gian cho chính xác
		if (((listTracking[i].lastUpdateId - listTracking[i].firstUpdateId) >  10) 
			&& ((index - listTracking[i].lastUpdateId) <  5 ))
		{
			listTracking[i].isPeople = true;
			count++;
		}
	}
	return count;
}
function TRACKING_UpdatedLabel (index,listLabel){
	listStateLabel[index].tUpdated = true;
}
//this function will be recall every 1 data
function TRACKING_UpdateObjectFree(index){
	for (var i = 0 ; i < listTracking.length ; i++ ){
		//tính theo thời gian cho chính xác
		if ( (index - listTracking[i].lastUpdateId) > 10 )
		{
			listTracking[i].dispo = true;
			listTracking[i].isPeople = false;
		}
	}
}

/**
*function find ID object Free
*this function will be call every update new object
*return Id Object Free
**/
function TRACKING_FindIdObjectFree (){
	var indexObject=-1; 
	for (var i = 0 ; i < listTracking.length ; i++ ){
		//tính theo thời gian cho chính xác
		if (listTracking[i].dispo)
		{
			indexObject = i;
			break;
		}
	}
	return indexObject;
}
//function mettre à jour list Tracking;
//Input newObject : true/false ; id Object will update ; tLabel
function TRACKING_UpdateObject (newObject , idObject , tLabel , dataIndex , dataTime ){
	//checking if valide idObject
	if((idObject >= 0) &&(idObject <= TRACKING_MAX_OBJECT))
	{
		if (newObject)
		{
			listTracking[idObject].firstUpdateId = dataIndex;
			listTracking[idObject].firstUpdateTime = dataTime;
			listTracking[idObject].direction = 0;
			listTracking[idObject].speed = 0;
			listTracking[idObject].isPeople = false;
		}
		else
		{
			var speed = 0; 
			var direction = 0;
			[speed , diretion] = TRACKING_CheckDirection(tLabel, listTracking[idObject].X, listTracking[idObject].Y);
			listTracking[idObject].direction = diretion;
			listTracking[idObject].speed = speed;
		}
		listTracking[idObject].X = tLabel.X;
		listTracking[idObject].Y = tLabel.Y;
		listTracking[idObject].S = tLabel.S;
		listTracking[idObject].lastUpdateId = dataIndex;
		listTracking[idObject].lastUpdateTime = dataTime;
		listTracking[idObject].dispo = false;
	}
	else
	{
		console.log("invalide idObject");
	}
}

/*************************************************************************************************/
//Research in Radius
function TRACKING_SearchPeople(tLabel , listTracking , dataIndex , dataTime , isPeople){
	var thight ,_width ,_height ,width;
	var distance = 255;
	var tableau = [];
	var type1 = 0;
	var type2 = 0;
	var type3 = 0;
	//console.log(tLabel);
	for (var i = 0 ; i < listTracking.length ; i++ )
	{
		//kiểm tra: nếu vật đang được update
		var valide = false;
		if (isPeople)
		{
			if (listTracking[i].isPeople)
			{
				valide = true;
			}
		}
		else
		{
			valide = true;
		}
		if ((listTracking[i].lastUpdateId > (dataIndex - 10)) && (valide))
		{
			var maxdif;
			//calculate size Radius
			[hight , _height, width , _width] = TRACKING_CalculateRadius (listTracking[i].direction , listTracking[i].speed);
			var difX = listTracking[i].X - tLabel.X;
			var difY = listTracking[i].Y - tLabel.Y;
			var compareY = hight;
			var compareX = width;
			//check if valide => update tableau
			if (difX < 0)
			{
				difX = 0 - difX;
				compareX = _width;
			}
			if (difY < 0)
			{
				difY = 0 - difY;
				compareY = _height; 
			}
			if ((difX <= compareX) && (difY <= compareY))
			{
				//check direction
				var same_direction = false;
				var same_position = false;
				var same_size = false;
				var type =0;
				var speed, direction;
				[speed , direction] = TRACKING_CheckDirection(tLabel,listTracking[i]);
				if (direction == 0)
				{
					same_position = true;
					same_direction = true;
				}
				else 
				{
					if (direction == listTracking[i].direction)
					{
						same_direction = true;
					}
				}
				//check size
				if ((listTracking[i].S >= (tLabel.S * 0.7))&&(listTracking[i].S <= (tLabel.S * 1.4)))
				{
					same_size = true;
				}
				//update type
				if (same_size){
					type++;
				}
				if (same_position){
					type++;
				}
				if (same_direction)
				{
					type++;
				}
				maxdif = max(difY ,difX);
				//Add this result in the list
				var object = { id : listTracking[i].id , value : type , distance :  maxdif};
				tableau.push(object)
				if (type == 3){
					type3++;
				}
				else if (type == 2){
					type2++;
				}
				else if (type == 1){
					type1++;
				}
			}
		}
	}
	//xử lý cái tableau;
	return [tableau, type3 , type2 , type1];
}
/*************************************************************************************************/
//Research in Radius
//kiểm tra cái này có ok hay không
//xem lịch sử chuyển động
//*****************************************************************//
function TRACKING_CheckDirection(tLabel, posX , posY ){
	var difX = tLabel.X - posX;
	var difY = tLabel.Y - posY;
	var speed = difX*difX + difY*difY;
	var direction = 0;
	var UP =false, DOWN =false, LEFT =false, RIGHT=false;
	if (difY < 0)
	{
		difY = -difY;
		if (difY > TRACKING_PERSON_MOVE_SIZE)
		{
			DOWN = true;
		}
	}
	else
	{
		if (difY > TRACKING_PERSON_MOVE_SIZE)
		{
			UP = true;
		}
	}

	if (difX < 0)
	{
		difX = -difX;
		if (difX > TRACKING_PERSON_MOVE_SIZE)
		{
			LEFT = true;
		}
	}
	else
	{
		if (difY > TRACKING_PERSON_MOVE_SIZE)
		{
			RIGHT = true;
		}
	}
	
	if ((!UP)&&(!DOWN)&&(!LEFT)&&(!RIGHT))
	{
		direction = 0;
	}
	else if ((UP)&&(!DOWN)&&(!LEFT)&&(!RIGHT))
	{
		direction = 1;
	}
	else if ((UP)&&(!DOWN)&&(!LEFT)&&(RIGHT))
	{
		direction = 2;
	}
	else if ((!UP)&&(!DOWN)&&(!LEFT)&&(RIGHT))
	{
		direction = 3;
	}
	else if ((!UP)&&(DOWN)&&(!LEFT)&&(RIGHT))
	{
		direction = 4;
	}
	else if ((!UP)&&(DOWN)&&(!LEFT)&&(!RIGHT))
	{
		direction = 5;
	}
	else if ((!UP)&&(DOWN)&&(LEFT)&&(!RIGHT))
	{
		direction = 6;
	}
	else if ((!UP)&&(!DOWN)&&(LEFT)&&(!RIGHT))
	{
		direction = 7;
	}
	else if ((UP)&&(!DOWN)&&(LEFT)&&(!RIGHT))
	{
		direction = 8;
	}
	return [speed, direction];
}
function TRACKING_CalculateRadius ( direction, speed){
	var hight = TRACKING_RADIUS_DEFAULT;
	var _hight = TRACKING_RADIUS_DEFAULT;
	var width = TRACKING_RADIUS_DEFAULT;
	var _width = TRACKING_RADIUS_DEFAULT;
	switch (direction){
		case 1 :
			hight += TRACKING_RADIUS_ADD_DIRECTION;
			break;
		case 2 :
			hight += TRACKING_RADIUS_ADD_DIRECTION;
			width += TRACKING_RADIUS_ADD_DIRECTION;
			break;
		case 3 :
			width += TRACKING_RADIUS_ADD_DIRECTION;
			break;
		case 4 :
			_hight += TRACKING_RADIUS_ADD_DIRECTION;
			width += TRACKING_RADIUS_ADD_DIRECTION;
			break;
		case 5 :
			_hight += TRACKING_RADIUS_ADD_DIRECTION;
			break;
		case 6 :
			_hight += TRACKING_RADIUS_ADD_DIRECTION;
			_width += TRACKING_RADIUS_ADD_DIRECTION;
			break;
		case 7 :
			_width += TRACKING_RADIUS_ADD_DIRECTION;
			break;
		case 8 :
			hight += TRACKING_RADIUS_ADD_DIRECTION;
			_width += TRACKING_RADIUS_ADD_DIRECTION;
			break;
		case 0 :
		default:
			break;
	}
	//check if move fast?
	if (speed >= TRACKING_SPEED_FAST) {
		hight += TRACKING_RADIUS_ADD_SPEED;
		_hight += TRACKING_RADIUS_ADD_SPEED;
		width += TRACKING_RADIUS_ADD_SPEED;
		_width += TRACKING_RADIUS_ADD_SPEED
	}
	else if (speed <= TRACKING_SPEED_MOYEN){
		hight -= TRACKING_RADIUS_ADD_SPEED;
		_hight -= TRACKING_RADIUS_ADD_SPEED;
		width -= TRACKING_RADIUS_ADD_SPEED;
		_width -= TRACKING_RADIUS_ADD_SPEED
	}
	return [ hight , _hight , width , _width ];
}