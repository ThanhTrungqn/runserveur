//Hàm chính của tracking (tất cả mọi step điều được trong này)
function TRACKING(listLabel , listTracking , dataIndex , dataTime , tracking_config){
	console.log(listLabel);
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
	//Coppy old result to other list before processing
	TRACKING_COPPY_LISTTRACKING_OLD(tracking_config);
	var listTrackingResult=[];
	var list_updated=[];

	//Vật to vật nhỏ ko chuyển động (dựa vào tọa độ và kích thước)
	for (var i = 0; i < listLabel.length ; i++){
		if (listStateLabel[i].tUpdated == false) 
		{
			var tLabel = listLabel[i];
			var list_id = TRACKING_SearchPeopleImmobile( listLabel[i] , listTracking ,dataIndex , dataTime , tracking_config);
			var newObject = false;
			var listNull=[];
			if (list_id.length > 1){
				for ( var j= 0; j < list_id.length ; j++)
				{
					idObject=list_id[j];
					TRACKING_UpdateObject (newObject , idObject , tLabel , dataIndex , dataTime  , list_id.length ,listNull , tracking_config);
				}
				TRACKING_UpdatedLabel(i,listLabel , listStateLabel);
			}
			else if (list_id.length == 1){
				idObject=list_id[0];
				TRACKING_UpdateObject (newObject , idObject , tLabel , dataIndex , dataTime  ,1 ,listNull , tracking_config);
				TRACKING_UpdatedLabel(i,listLabel,listStateLabel);
			}
		}
	}

	//Loop 1 : Update tất cả các vật có cùng size và san sát nhau
	var continue_loop=true;
	while(continue_loop)
	{
		var updated=false;
		for (var i = 0; i < listLabel.length ; i++)
		{
			if (listStateLabel[i].tUpdated == false) 
			{
				var tLabel = listLabel[i];
				var idObject= TRACKING_SearchPeople1( listLabel[i] , listTracking ,dataIndex , dataTime , tracking_config.radius_default_1); //update xong list
				if (idObject >=0)
				{
					console.log("go here SearchPeople1");
					var newObject = false;
					var listNull=[];
					TRACKING_UpdateObject (newObject , idObject , tLabel , dataIndex , dataTime  ,1 ,listNull , tracking_config);
					TRACKING_UpdatedLabel( i, listLabel,listStateLabel);
					updated=true;
				}
			}
		}
		if (updated==false){
			continue_loop=false;
		}
	}

	//Loop 2 : Update tất cả các vật gần nhau và cùng size
	for (var i = 0; i < listLabel.length ; i++)
	{
		if (listStateLabel[i].tUpdated == false) 
		{
			var tLabel = listLabel[i];
			var idObject= TRACKING_SearchPeople2( listLabel[i] , listTracking ,dataIndex , dataTime , tracking_config.radius_default_2); //update xong list
			if (idObject >=0)
			{
				console.log("go here SearchPeople2");
				var newObject = false;
				var listNull=[];
				TRACKING_UpdateObject (newObject , idObject , tLabel , dataIndex , dataTime  ,1 ,listNull , tracking_config);
				TRACKING_UpdatedLabel( i, listLabel,listStateLabel);
			}
		}
	}

	//Loop 3 : Update tất cả các vật gần nhau
	for (var i = 0; i < listLabel.length ; i++)
	{
		if (listStateLabel[i].tUpdated == false) 
		{
			var tLabel = listLabel[i];
			var idObject= TRACKING_SearchPeople3( listLabel[i] , listTracking ,dataIndex , dataTime , tracking_config.radius_default_3); //update xong list
			if (idObject >=0)
			{
				console.log("go here SearchPeople3");
				var newObject = false;
				var listNull=[];
				TRACKING_UpdateObject (newObject , idObject , tLabel , dataIndex , dataTime  ,1 ,listNull , tracking_config);
				TRACKING_UpdatedLabel( i, listLabel,listStateLabel);
			}
		}
	}

	//Loop 4 :  Cập nhật tất cả các vật to
	//Cập nhật các vật to
	for (var i = 0; i < listLabel.length ; i++){
		if (listStateLabel[i].tUpdated == false) 
		{
			var tLabel = listLabel[i];
			var list_updated, type1 , type2, type3;
			[list_updated , type3 , type2 , type1]=TRACKING_SearchPeople( listLabel[i] , listTracking ,dataIndex , dataTime , true, true, tracking_config); //update xong list
			var updatedLabel = false;
			//so sánh cái size 1 chút
			if (list_updated.length >= 1 )
			{
				console.log ("go here 555");
				updatedLabel = true;
				for (var j = 0; j < list_updated.length ; j++ ){

					var idObject = list_updated[j].id;
					//điều kiện ràng buộc
					var newObject = false;
					var listNull=[];
					TRACKING_UpdateObject (newObject, idObject, tLabel, dataIndex, dataTime, list_updated.length, listNull , tracking_config);
				}
			}
			if (updatedLabel)
			{
				TRACKING_UpdatedLabel(i,listLabel,listStateLabel);
			}
		}
	}
	//Step 5 : các vật còn sót lại
	for (var i = 0; i < listLabel.length ; i++){
		if (listStateLabel[i].tUpdated == false) 
		{
			console.log("go here 666");
			var newObject = true;
			var listId=TRACKING_Update_Why_Exist(tLabel, listTracking_Old, dataIndex, dataTime, true);
			var idObject = TRACKING_FindIdObjectFree(tLabel);
			TRACKING_UpdateObject (newObject, idObject, tLabel, dataIndex, dataTime , 1 , listId , tracking_config);
			TRACKING_UpdatedLabel(i,listLabel,listStateLabel);
		}
	}
	//Step 6 : kiểm tra các vật biến mất và xem nguyên nhân
	TRACKING_PersonDisparu(dataIndex,dataTime ,listLabel , tracking_config);
	//Step 7 : decide nombre de person
	var count = TRACKING_DecidePerson(dataIndex, dataTime , tracking_config);
	//Step 8 : Update listTracking
	TRACKING_UpdateObjectFree(dataIndex , dataTime , tracking_config);
	return count;
}

function TRACKING_DecidePerson(index , time , tracking_config){
	//nếu vật xuất hiện thường xuyên
	//nếu trong 1 phút vật có di chuyển
	//vật xuất hiện ở đâu
	var count = 0;
	for (var i = 0 ; i < listTracking.length ; i++ ){
		//tính theo thời gian cho chính xác
		if ( ((time - listTracking[i].lastUpdateTime) < 1000)  
			&& ((listTracking[i].lastUpdateTime - listTracking[i].firstUpdateTime ) > 500 ))
		{
			if (listTracking[i].isPeople)
			{
				count++;
			}
			else
			{
				//chỗ này vật tăng thêm nè
				//điều kiện là vật có kích thước hơi to vầ quãng đường đã đi, cũng phải được kha khá
				if (listTracking[i].move)	//nếu vật này có di chuyển
				{
					//check xem vị trí đầu tiên ở đâu
					if (listTracking[i].listIdNear >=0 )
					{
						console.log("switch here");
						TRACKING_ChangeObject (i,listTracking[i].listIdNear , tracking_config);

						//var id_check =   listTracking[i].listIdNear;
						//if (listTracking[id_check].lastUpdateTime == time){
						//	listTracking[i].isPeople = true;
						//}
						//else 
						//{
						//	TRACKING_ChangeObject (i,listTracking[i].listIdNear , tracking_config);
						//}
					}
					else 
					{
						listTracking[i].isPeople = true;
						INIT_MATRIX_BORD_IN[listTracking[i].firstY*INIT_MATRIX_WIDTH+listTracking[i].firstX]+=1;
					}
				}
				else if ((listTracking[i].lastUpdateTime - listTracking[i].firstUpdateTime ) > tracking_config.time_person_active){
					//check xem vị trí đầu tiên ở đâu
					if (listTracking[i].listIdNear >=0 )
					{
						console.log("no switch here");
						listTracking[i].isPeople = true;
						//TRACKING_ChangeObject (i,listTracking[i].listIdNear , tracking_config);
					}
					else 
					{
						listTracking[i].isPeople = true;
						INIT_MATRIX_BORD_IN[listTracking[i].Y*INIT_MATRIX_WIDTH+listTracking[i].X]+=1;
					}
				}
			}
		}
	}
	return count;
}

function TRACKING_PersonDisparu(index,time_index ,listLabel , tracking_config){
	//1 người biến mất 	=> vật to mà update chỉ 1
	//					=> đi nhanh quá nó theo ko kịp chú
	for (var i = 0 ; i < listTracking.length ; i++ )
	{
		//Người biến mất thì hãy tìm
		if ( (listTracking[i].isPeople == true) && (listTracking[i].lastUpdateTime < time_index))
		{
			console.log("bien mat ne");
			//Kiểm tra biến mất ở đâu => nếu biến mất ở cửa thì bye bye
			if (TRACKING_CheckNearBord(listTracking[i].X,listTracking[i].Y)==false)	//Nếu không
			{
				var update=false; 
				//vật này đang sắp biết mất
				//Tìm lại trong list, có vật nào vừa xuất hiện không 
				if (update==false)
				{
					for (var j = 0 ; j < listTracking.length ; j++ )
					{
						//đi nhanh quá nè chú đi chậm lại chút nào
						//Tìm những vật vừa mới xuất hiện trong khoảng thời gian
						if ((((listTracking[j].firstUpdateTime - listTracking[i].lastUpdateTime) < 500 )
							|| ((listTracking[i].lastUpdateTime -listTracking[j].firstUpdateTime) < 500 ) )
							&& (listTracking[j].lastUpdateTime == time_index)
							&& (listTracking[j].isPeople == false))
						{
							//Kiểm tra tọa độ thỏa mãn hay không
							//Vị trí xuất hiện đầu tiên
							var difX = listTracking[j].firstX - listTracking[i].X;
							var difY = listTracking[j].firstY - listTracking[i].Y;
							if (difX < 0)
							{
								difX = - difX;
							}
							if (difY < 0)
							{
								difY = - difY;
							}
							console.log("difX: "+difX );
							console.log("difY: "+difY );
							if ( max(difX,difY) <= 10){
								console.log("go here 777");
								//coppy j in i
								TRACKING_ChangeObject (j,i , tracking_config);
								update = true;
								break;
							}
						}
					}
						
				}
				if (update==false)
				{
					//To mà chỉ update 1 nè
					//=> Xem list cũ, nó ở bên cạnh đứa nào => đứa đó được update ở đâu
					for (var j=0; j < listLabel.length ; j++ )
					{
						var difX = listLabel[j].X -  listTracking[i].X;	
						var difY = listLabel[j].Y -  listTracking[i].Y;
						if (difX < 0)
						{
							difX = -difX;
						}
						if (difY < 0)
						{
							difY = -difY;
						}
						//thêm đk size nữa
						if ((difX <= 6) && (difY <= 6)){
							console.log("go here big big big object");
							var listId=[];
							TRACKING_UpdateObject (false, i, listLabel[j], index, time_index , 2 , listId , tracking_config);
							update = true;
							break;
						}
					}
				}
				if (update ==false){
					console.log("bieesn maast thaajt ne");
				}
			}
			else
			{
				console.log("bien mat gan cua");
			}		
		}
	}
}

function TRACKING_UpdatedLabel (index,listLabel, listStateLabel){
	listStateLabel[index].tUpdated = true;
}
//this function will be recall every 1 data
function TRACKING_UpdateObjectFree(index , time , tracking_config){
	for (var i = 0 ; i < listTracking.length ; i++ ){
		//tính theo thời gian cho chính xác
		if (listTracking[i].isPeople)
		{
			if ( (time - listTracking[i].lastUpdateTime) > tracking_config.time_person_active )
			{
				listTracking[i].dispo = true;
				listTracking[i].isPeople = false;
				INIT_MATRIX_BORD_OUT[listTracking[i].Y * INIT_MATRIX_WIDTH +listTracking[i].X ]+=1;
			}
		}
		else
		{
			if ( (time - listTracking[i].lastUpdateTime) >  tracking_config.time_person_inactive  )
			{
				listTracking[i].dispo = true;
				listTracking[i].isPeople = false;
			}
		}
	}
}

/**
*function find ID object Free
*this function will be call every update new object
*return Id Object Free
**/
function TRACKING_FindIdObjectFree ( label){
	var indexObject=-1; 
	for (var i = 0 ; i < listTracking.length ; i++ ){
		//tính theo thời gian cho chính xác
		if (listTracking[i].dispo)
		{
			var difX = listTracking[i].X - label.X;
			var difY = listTracking[i].Y - label.Y;
			//check if valide => update tableau
			if (difX < 0)
			{
				difX = 0 - difX;
			}
			if (difY < 0)
			{
				difY = 0 - difY;
			}
			if ((difX <= 4) && (difY <= 4))
			{
				indexObject = i;
				return indexObject;
			}
		}
	}
	for (var i = 0 ; i < listTracking.length ; i++ ){
		if (listTracking[i].dispo)
		{
			indexObject = i;
			return indexObject;
		}
	}
	return indexObject;
}
//function mettre à jour list Tracking;
//Input newObject : true/false ; id Object will update ; tLabel
function TRACKING_UpdateObject (newObject , idObject , tLabel , dataIndex , dataTime , isBigObject, listIdNear , tracking_config){
	//checking if valide idObject
	if((idObject >= 0) &&(idObject <= tracking_config.max_object))
	{
		if (newObject)
		{
			listTracking[idObject].firstUpdateId = dataIndex;
			listTracking[idObject].firstUpdateTime = dataTime;
			listTracking[idObject].direction = 0;
			listTracking[idObject].speed = 0;
			listTracking[idObject].isPeople = false;
			listTracking[idObject].firstX = tLabel.X;
			listTracking[idObject].firstY = tLabel.Y;
			listTracking[idObject].move = false;
			//Need function check voisinage when this person exist
			listTracking[idObject].listIdNear=listIdNear;
			//INIT_MATRIX_BORD_IN[tLabel.Y*INIT_MATRIX_WIDTH+tLabel.X]+=1;
			//for (var i = 0 ; i < listIdNear.length ; i ++ )
			//{
			//	listTracking[idObject].listIdNear[i]=listIdNear[i];
			//}
		}
		else
		{
			var speed = 0; 
			var direction = 0;
			if ((listTracking[idObject].X != tLabel.X) 
				|| (listTracking[idObject].Y != tLabel.Y)
				|| (listTracking[idObject].S != tLabel.S))
			{
				[speed , direction] = TRACKING_CheckDirection(tLabel, listTracking[idObject].X, listTracking[idObject].Y , tracking_config);
				listTracking[idObject].direction = direction;
				listTracking[idObject].speed = speed;
			}
		}
		listTracking[idObject].isbigObject = isBigObject;
		listTracking[idObject].X = tLabel.X;
		listTracking[idObject].Y = tLabel.Y;
		listTracking[idObject].S = tLabel.S;
		listTracking[idObject].lastUpdateId = dataIndex;
		listTracking[idObject].lastUpdateTime = dataTime;
		listTracking[idObject].dispo = false;
		//This section for valide this person move or not
		var difX= listTracking[idObject].X - listTracking[idObject].firstX;
		var difY= listTracking[idObject].Y - listTracking[idObject].firstY;
		var dist= difX*difX + difY*difY;
		if (listTracking[idObject].move==false)
		{
			if (dist >= tracking_config.people_distance)
			{
				//đây là 1 người
				listTracking[idObject].move=true;
				//tìm hiểu nguyên nhân xuất hiện nào
			}
		}
	}
	else
	{
		console.log("invalide idObject");
	}
}
function TRACKING_ChangeObject (idObject_src,idObject_des , tracking_config){
	//checking if valide idObject
	if((idObject_src >= 0) &&(idObject_src <= tracking_config.max_object) 
		&& (idObject_des >= 0) &&(idObject_des <= tracking_config.max_object)
		&& (idObject_src != idObject_des))
	{
		listTracking[idObject_des].X = listTracking[idObject_src].X;
		listTracking[idObject_des].Y = listTracking[idObject_src].Y;
		listTracking[idObject_des].S = listTracking[idObject_src].S;
		listTracking[idObject_des].lastUpdateId = listTracking[idObject_src].lastUpdateId;
		listTracking[idObject_des].lastUpdateTime = listTracking[idObject_src].lastUpdateTime;
		listTracking[idObject_des].dispo = false;
		listTracking[idObject_src].dispo = true;
		listTracking[idObject_src].isPeople = false;
	}
	else
	{
		console.log("invalide idObject");
	}
}

/*************************************************************************************************/
//Research in Radius
function TRACKING_SearchPeople(tLabel , t_listTracking , dataIndex , dataTime , isPeople , notUpdated , tracking_config){
	var hight ,_width ,_height ,width;
	var distance = 255;
	var tableau = [];
	var type1 = 0;
	var type2 = 0;
	var type3 = 0;
	//console.log(tLabel);
	for (var i = 0 ; i < t_listTracking.length ; i++ )
	{
		//kiểm tra: nếu vật đang được update
		var valide = true;
		if (isPeople)
		{
			if (t_listTracking[i].isPeople == false)
			{
				valide = false;
			}
		}
		if (notUpdated)
		{
			if (t_listTracking[i].lastUpdateId >= dataIndex) //nếu vật update rồi thì thôi
			{
				valide = false;
			}
		}
		//verifier if this personne isnt updated for this data
		if ((t_listTracking[i].dispo == false) && (valide))
		{
			var maxdif;
			//calculate size Radius
			[hight , _height, width , _width] = TRACKING_CalculateRadius (t_listTracking[i].direction , t_listTracking[i].speed , tracking_config);
			var difX = t_listTracking[i].X - tLabel.X;
			var difY = t_listTracking[i].Y - tLabel.Y;
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
				[speed , direction] = TRACKING_CheckDirection(tLabel , t_listTracking[i].X , t_listTracking[i].Y, tracking_config);
				if (speed <= 20)
				{
					same_position = true;
				}
				else 
				{
					if (direction == t_listTracking[i].direction)
					{
						same_direction = true;
					}
				}
				//check size
				if ((t_listTracking[i].S >= (tLabel.S * 0.7))&&(t_listTracking[i].S <= (tLabel.S * 1.5)))
				{
					same_size = true;
					same_direction = true;
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
				var list_id_null=[];
				//Add this result in the list
				var object = { id : t_listTracking[i].id , list_id : list_id_null , value : type, distance :  maxdif,
								 posX : t_listTracking[i].X , posY : t_listTracking[i].Y} ;
				tableau.push(object);
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
		//xong 1 vật
	}
	return [tableau, type3 , type2 , type1];
}
/***************************************************************************************/
function TRACKING_SearchPeopleImmobile(tLabel , t_listTracking , dataIndex , dataTime)
{
	var hight ,_width ,_height ,width;
	var distance = 255;
	var tableau = [];
	var list_null=[];
	for (var i = 0 ; i < t_listTracking.length ; i++ )
	{
		//verifier if this personne isnt updated for this data
		if ((t_listTracking[i].dispo == false) && (t_listTracking[i].lastUpdateId < dataIndex))
		{
			//calculate size Radius
			var difX = t_listTracking[i].X - tLabel.X;
			var difY = t_listTracking[i].Y - tLabel.Y;
			var compareY = 4;
			var compareX = 4;
			if (difX < 0)
			{
				difX = 0 - difX;
			}
			if (difY < 0)
			{
				difY = 0 - difY;
			}
			if ((difX <= compareX) && (difY <= compareY))
			{
				var same_position = false;
				var same_size = false;
				var type =0;
				var speed=difX*difX + difY*difY;
				//check speed
				if (speed <= 16)
				{
					same_position = true;
					type++;
				}
				//check size
				if (t_listTracking[i].S == tLabel.S )
				{
					same_size = true;
					type++;
				}
				//If no immobile => Update
				if  (type==2)
				{
					var object = { id : t_listTracking[i].id , list_id : list_null,
									 posX : t_listTracking[i].X , posY : t_listTracking[i].Y } ;
					tableau.push(object);
				}
			}
		}
		//xong 1 vật
	}
	//Xử lý lại cái list
	if (tableau.length >= 1)
	{
		for (var i = 0 ;  i < tableau.length ; i ++) 
		{
			tableau[i].list_id.push(tableau[i].id);
			for (var j = j+1 ; j < tableau.length ; j ++)
			{
				if ((tableau[i].posX == tableau[j].posX ) &&(tableau[i].posY == tableau[j].posY))
				{
					tableau[i].list_id.push(tableau[i].id);
					tableau.splice(j, 1);
					j--;
				}
			}
		}
		return tableau[0].list_id;
	}
	var list_null=[];
	return list_null;
}
/***************************************************************************************/
/***************************************************************************************/
function TRACKING_SearchPeople1(tLabel , t_listTracking , dataIndex , dataTime , radius_size)
{
	var distance = 255;
	var count=0;
	var id_object=-1;
	var id_object_null=-1;
	for (var i = 0 ; i < t_listTracking.length ; i++ )
	{
		//verifier if this personne isn't updated for this data
		if ((t_listTracking[i].dispo == false) && (t_listTracking[i].lastUpdateId < dataIndex))
		{
			//calculate size Radius
			var difX = t_listTracking[i].X - tLabel.X;
			var difY = t_listTracking[i].Y - tLabel.Y;
			var compareY = radius_size;
			var compareX = radius_size;
			if (difX < 0)
			{
				difX = 0 - difX;
			}
			if (difY < 0)
			{
				difY = 0 - difY;
			}
			if ((difX <= compareX) && (difY <= compareY)
				&& (t_listTracking[i].S >= (tLabel.S * 0.7))
				&&(t_listTracking[i].S <= (tLabel.S * 1.3)))
			{
				count++;
				id_object = i;
			}
		}
	}
	if (count==1){
		return id_object;
	}
	else
	{
		return id_object_null;
	}
}
function TRACKING_SearchPeople2(tLabel , t_listTracking , dataIndex , dataTime , radius_size)
{
	var distance = 255;
	var count=0;
	var id_object=-1;
	var id_object_null=-1;
	for (var i = 0 ; i < t_listTracking.length ; i++ )
	{
		//verifier if this personne isnt updated for this data
		if ((t_listTracking[i].dispo == false) && (t_listTracking[i].lastUpdateId < dataIndex))
		{
			//calculate size Radius
			var difX = t_listTracking[i].X - tLabel.X;
			var difY = t_listTracking[i].Y - tLabel.Y;
			var compareY = radius_size;
			var compareX = radius_size;
			if (difX < 0)
			{
				difX = 0 - difX;
			}
			if (difY < 0)
			{
				difY = 0 - difY;
			}

			if ( (difX <= compareX) && (difY <= compareY) 
				&& (t_listTracking[i].S >= (tLabel.S * 0.7))
				&&(t_listTracking[i].S <= (tLabel.S * 1.3)) )
			{
				if ( distance > max(difX, difY))
				{
					id_object = i;
					distance = max(difX, difY);
				}
			}
		}
	}
	return id_object;
}
function TRACKING_SearchPeople3(tLabel , t_listTracking , dataIndex , dataTime , radius_size)
{
	var distance = 255;
	var count=0;
	var id_object=-1;
	var id_object_null=-1;
	for (var i = 0 ; i < t_listTracking.length ; i++ )
	{
		//verifier if this personne isnt updated for this data
		if ((t_listTracking[i].dispo == false) && (t_listTracking[i].lastUpdateId < dataIndex))
		{
			//calculate size Radius
			var difX = t_listTracking[i].X - tLabel.X;
			var difY = t_listTracking[i].Y - tLabel.Y;
			var compareY = radius_size;
			var compareX = radius_size;
			if (difX < 0)
			{
				difX = 0 - difX;
			}
			if (difY < 0)
			{
				difY = 0 - difY;
			}

			if ((difX <= compareX) && (difY <= compareY))
			{
				if (distance > max(difX, difY))
				{
					id_object = i;
					distance = max(difX, difY)
				}
			}
		}
	}
	return id_object;
}
function TRACKING_SearchListIdPeopleNear(tLabel , t_listTracking , dataIndex , dataTime)
{
	if ( true)
	{
		var list_id=[];
		var max_value=255;
		var id=-1;
		for (var i = 0 ; i < t_listTracking.length ; i++ )
		{
			if ((t_listTracking[i].dispo == false) && (t_listTracking[i].isPeople))
			{
				//calculate size Radius
				var difX = t_listTracking[i].X - tLabel.X;
				var difY = t_listTracking[i].Y - tLabel.Y;
				var compareY = 8;
				var compareX = 8;
				if (difX < 0)
				{
					difX = 0 - difX;
				}
				if (difY < 0)
				{
					difY = 0 - difY;
				}

				if ((difX <= compareX) && (difY <= compareY))
				{
					if ( max_value > max(difY , difX))
					{
						id = i;
						max_value = max(difY , difX);
					}
				}
			}
		}
		if (id==-1)
		{
			for (var i = 0 ; i < t_listTracking.length ; i++ )
			{
				if ((t_listTracking[i].dispo == false) && (t_listTracking[i].isPeople))
				{
					//calculate size Radius
					var difX = t_listTracking[i].X - tLabel.X;
					var difY = t_listTracking[i].Y - tLabel.Y;
					var compareY = 12;
					var compareX = 12;
					if (difX < 0)
					{
						difX = 0 - difX;
					}
					if (difY < 0)
					{
						difY = 0 - difY;
					}

					if ((difX <= compareX) && (difY <= compareY))
					{
						if ( max_value > max(difY , difX))
						{
							id = i;
							max_value = max(difY , difX);
						}
					}
				}
			}
		}
	}
	if (id != -1){
		return id;
	}
	if (TRACKING_CheckNearBord(tLabel.X ,  tLabel.Y) == true)
	{
		return -2;
	}
	else{
		return id;
	}
}
/***************************************************************************************/
function TRACKING_Update_Why_Exist(t_label , t_listTracking ,dataIndex , dataTime , isPeople){
	var list_id= TRACKING_SearchListIdPeopleNear(t_label , t_listTracking , dataIndex , dataTime);
	return list_id;
}
/***************************************************************************************/
function TRACKING_CheckNearBord(PosX , PosY){
	//Vu in luminaire
	var VALUE_CONSTANT = 4;
	var posX=Math.round(PosX);
	var posY=Math.round(PosY);
	if ( ((posX + VALUE_CONSTANT )<= INIT_MATRIX_WIDTH) && ( (posX - VALUE_CONSTANT ) >= 0)
			 && ((posY + VALUE_CONSTANT )<= INIT_MATRIX_HEIGHT) && ( (posY - VALUE_CONSTANT ) >= 0))
	{
		if (   ( INIT_MATRIX [  posY 				 * INIT_MATRIX_WIDTH + ( posX - VALUE_CONSTANT)	] >=1 )
			&& ( INIT_MATRIX [  posY 				 * INIT_MATRIX_WIDTH + ( posX + VALUE_CONSTANT)	] >=1 )
			&& ( INIT_MATRIX [(posY- VALUE_CONSTANT) * INIT_MATRIX_WIDTH + ( posX - VALUE_CONSTANT) ] >=1 )
			&& ( INIT_MATRIX [(posY- VALUE_CONSTANT) * INIT_MATRIX_WIDTH +   posX   				] >=1 )
			&& ( INIT_MATRIX [(posY- VALUE_CONSTANT) * INIT_MATRIX_WIDTH + ( posX + VALUE_CONSTANT) ] >=1 )
			&& ( INIT_MATRIX [(posY+ VALUE_CONSTANT) * INIT_MATRIX_WIDTH + ( posX - VALUE_CONSTANT) ] >=1 )
			&& ( INIT_MATRIX [(posY+ VALUE_CONSTANT) * INIT_MATRIX_WIDTH +   posX   				] >=1 )
			&& ( INIT_MATRIX [(posY+ VALUE_CONSTANT) * INIT_MATRIX_WIDTH + ( posX + VALUE_CONSTANT) ] >=1 ))
		{
			return false;
		}
	}
	return true;  
}
/*************************************************************************************************/
//Research in Radius
//kiểm tra cái này có ok hay không
//xem lịch sử chuyển động
//*****************************************************************//
function TRACKING_CheckDirection(tLabel, posX , posY , tracking_config){
	var difX = tLabel.X - posX;
	var difY = tLabel.Y - posY;
	var speed = difX*difX + difY*difY;
	var UP =false, DOWN =false, LEFT =false, RIGHT=false;
	if (difY < 0)
	{
		difY = -difY;
		if (difY > tracking_config.person_move_size)
		{
			DOWN = true;
		}
	}
	else
	{
		if (difY > tracking_config.person_move_size)
		{
			UP = true;
		}
	}

	if (difX < 0)
	{
		difX = -difX;
		if (difX > tracking_config.person_move_size)
		{
			LEFT = true;
		}
	}
	else
	{
		if (difY > tracking_config.person_move_size)
		{
			RIGHT = true;
		}
	}
	var direction =-1;
	if (( UP == false ) && ( DOWN == false ) && ( LEFT == false ) && ( RIGHT == false ) )
	{
	    direction = 0;
	}
	if (( UP == true ) && ( DOWN == false ) && ( LEFT == false ) && ( RIGHT == false ))
	{
		direction = 1;
	}
	if (( UP == true ) && ( DOWN == false ) && ( LEFT == false ) && ( RIGHT == true ))
	{
		direction = 2;
	}
	if (( UP == false ) && ( DOWN == false ) && ( LEFT == false ) && ( RIGHT == true ))
	{
		direction = 3;
	}
	if (( UP == false ) && ( DOWN == true ) && ( LEFT == false ) && ( RIGHT == true ))
	{
		direction = 4;
	}
	if (( UP == false ) && ( DOWN == true ) && ( LEFT == false ) && ( RIGHT == false ))
	{
		direction = 5;
	}
	if (( UP == false ) && ( DOWN == true ) && ( LEFT == true ) && ( RIGHT == false ))
	{
		direction = 6;
	}
	if (( UP == false ) && ( DOWN == false ) && ( LEFT == true ) && ( RIGHT == false ))
	{
		direction = 7;
	}
	if (( UP == true ) && ( DOWN == false ) && ( LEFT == true ) && ( RIGHT == false ))
	{
		direction = 8;
	}
	return [speed, direction];
}
function TRACKING_CalculateRadius ( direction, speed , tracking_config){
	var hight = tracking_config.radius_default;
	var _hight = tracking_config.radius_default;
	var width = tracking_config.radius_default;
	var _width = tracking_config.radius_default;
	switch (direction){
		case 1 :
			hight += tracking_config.radius_add_direction;
			break;
		case 2 :
			hight += tracking_config.radius_add_direction;
			width += tracking_config.radius_add_direction;
			break;
		case 3 :
			width += tracking_config.radius_add_direction;
			break;
		case 4 :
			_hight += tracking_config.radius_add_direction;
			width += tracking_config.radius_add_direction;
			break;
		case 5 :
			_hight += tracking_config.radius_add_direction;
			break;
		case 6 :
			_hight += tracking_config.radius_add_direction;
			_width += tracking_config.radius_add_direction;
			break;
		case 7 :
			_width += tracking_config.radius_add_direction;
			break;
		case 8 :
			hight += tracking_config.radius_add_direction;
			_width += tracking_config.radius_add_direction;
			break;
		case 0 :
		default:
			break;
	}
	//check if move fast?
	if (speed >= tracking_config.speed_fast) {
		hight += tracking_config.radius_add_speed ;
		_hight += tracking_config.radius_add_speed;
		width += tracking_config.radius_add_speed;
		_width += tracking_config.radius_add_speed
	}
	else if (speed <= tracking_config.speed_moyen){
		hight -= tracking_config.radius_add_speed;
		_hight -= tracking_config.radius_add_speed;
		width -= tracking_config.radius_add_speed;
		_width -= tracking_config.radius_add_speed
	}
	return [ hight , _hight , width , _width ];
}
function TRACKING_COPPY_LISTTRACKING_OLD(tracking_config) {
	listTracking_Old=[];
	for (var i = 0 ; i < tracking_config.max_object ; i ++)
	{
		var person= {id: i,
			X: 			listTracking[i].X,
			Y: 			listTracking[i].Y,
			S: 			listTracking[i].S,
			isPeople: 	listTracking[i].isPeople,
			move: 		listTracking[i].move,
			firstUpdateId: 	listTracking[i].firstUpdateId,
			firstUpdateTime:listTracking[i].firstUpdateTime,
			direction: 	listTracking[i].direction,
			speed: 		listTracking[i].speed,
			lastUpdateId: 	listTracking[i].lastUpdateId,
			lastUpdateTime: listTracking[i].lastUpdateTime,
			dispo:  	listTracking[i].dispo,
			firstX: 	listTracking[i].firstX,
			firstY: 	listTracking[i].firstY};
		listTracking_Old.push(person);
	}
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