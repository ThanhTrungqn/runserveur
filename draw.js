var color_take=["#ff0000","#770000","#330000","#337700","#777700","#007700","#00ff00","#00ffff","#0077ff","#000000","#444444"];
function draw(){

	var canvas = document.getElementById("mycanvas");
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (var i =0 ; i< TRACKING_MAX_OBJECT ; i++ )
	{
		if(listTracking[i].dispo == false )
		{
			ctx.fillStyle =color_take[i];
			ctx.strokeStyle = color_take[i];
			if (listTracking[i].isPeople)
			{
				ctx.fillRect(listTracking[i].X*10,listTracking[i].Y*10,40*listTracking[i].isbigObject,40*listTracking[i].isbigObject);
			}
			else 
			{
				ctx.strokeRect(listTracking[i].X*10,listTracking[i].Y*10,40,40);
			}
		}
	}
}