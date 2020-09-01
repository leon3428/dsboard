$(function(){
    /*setInterval(function(){
        alert("Hello"); 
    }, 1000);*/


    //zooming
    var slider = document.getElementById("zoomSlider");

    slider.oninput = resizePlots;
    
    var lastVal = 4;
    function resizePlots() {
        if(this.value != undefined){
            lastVal = this.value;
        }

        var contW = $("#plotContainer").width();
        contW = Math.floor( contW-20);
        var plotW = Math.floor(contW/(lastVal)-20);
        var plotH = Math.floor(plotW*0.6);

        plotW = plotW.toString() + "px";
        plotH = plotH.toString() + "px";

        $('.plot').css({width: plotW, height: plotH});
    }

    resizePlots();
    window.addEventListener("resize", resizePlots);

    //opening projects
    $('#fileIn').change(function() { 
        var fr=new FileReader(); 
        fr.onload=function(){ 
            console.log(fr.result); 
        } 
            
        fr.readAsText(this.files[0]); 
    }) 


    //drawing plots
    drawPlot();

    function drawPlot()
    {
        var data = {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            datasets: [{
                label: "Dataset #1",
                backgroundColor: "rgba(255,99,132,0.2)",
                borderColor: "rgba(255,99,132,1)",
                borderWidth: 2,
                hoverBackgroundColor: "rgba(255,99,132,0.4)",
                hoverBorderColor: "rgba(255,99,132,1)",
                data: [65, 59, 20, 81, 56, 55, 40],
            }]
        };
          
        var options = {
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                stacked: true,
                gridLines: {
                    display: true,
                    color: "rgba(255,99,132,0.2)"
                }
                }],
                xAxes: [{
                gridLines: {
                    display: false
                }
                }]
            }
        };
          
        Chart.Bar('myChart', {
            options: options,
            data: data
        });
    }
})

