var color_take=["#ff0000","#770000","#330000","#337700","#777700","#007700","#00ff00","#00ffff","#0077ff","#000000","#444444","#0000ff"];
function draw(){
	var canvas = document.getElementById("mycanvas");
	var ctx = canvas.getContext("2d");
	if (canvas.height != INIT_MATRIX_HEIGHT*10){
		canvas.height = INIT_MATRIX_HEIGHT*10;
	}
	if (canvas.width != INIT_MATRIX_WIDTH*10){
		canvas.width = INIT_MATRIX_WIDTH*10;
	} 
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i =0 ; i< TRACKING_MAX_OBJECT ; i++ )
	{
		if(listTracking[i].dispo == false )
		{
			ctx.fillStyle =color_take[i];
			ctx.strokeStyle = color_take[i];
			if (listTracking[i].isPeople)
			{
				ctx.fillRect(listTracking[i].X*10,listTracking[i].Y*10,listTracking[i].S,listTracking[i].S);
				//ctx.fillRect(listTracking[i].X*10,listTracking[i].Y*10,40*listTracking[i].isbigObject,40*listTracking[i].isbigObject);
			}
			else 
			{
				ctx.strokeRect(listTracking[i].X*10,listTracking[i].Y*10,listTracking[i].S,listTracking[i].S);
				//ctx.strokeRect(listTracking[i].X*10,listTracking[i].Y*10,40,40);
			}
		}
	}
	/*
	for(var i=0;i< INIT_MATRIX_HEIGHT ; i++)
	{
		for (var j =0 ; j< INIT_MATRIX_WIDTH ; j++)
		{
			if(INIT_MATRIX_BORD_IN[i*INIT_MATRIX_WIDTH+j] >0){
				var add=INIT_MATRIX_BORD_IN[i*INIT_MATRIX_WIDTH+j];
				ctx.fillStyle =color_take[10];
				ctx.fillRect(j*10,i*10,5+add/3,5+add/3);
			}
			if(INIT_MATRIX_BORD_OUT[i*INIT_MATRIX_WIDTH+j] >0){
				var add=INIT_MATRIX_BORD_OUT[i*INIT_MATRIX_WIDTH+j];
				ctx.fillStyle =color_take[11];
				ctx.fillRect(j*10,i*10,5+add/3,5+add/3);
			}
		}
	}
	*/
}