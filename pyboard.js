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
    var projects = [];
    var project = '';
    var selectedProject = 0;

    $('#fileIn').change(function() { 
        var fr=new FileReader(); 
        fr.onload=function(){ 
            project = JSON.parse(fr.result);  
        } 
            
        fr.readAsText(this.files[0]); 
    })
    
    $('#btnSub').on('click', function(){
        projects.push(project);
        var name = project[0].project_name;
        var id = projects.length-1;
        $('#projectsDropdown').append('<p class="dropdown-item projectItem" id="'+ id.toString() +'">' + name +'</p>');
        $("#browseModal .close").click();
        selectedProject = projects.length-1;
        refreshView();
    })

    function refreshView()
    {
        var m_project = projects[selectedProject];
        $('#plotContainer').empty();
        for(var i = 1;i < m_project.length; i++)
        {
            var htmlLine = '<div class="plot" id = "plot'+ i.toString() +'"><canvas id="Chart'+ i.toString() +'" class="plotCanvas"></canvas></div>';
            $('#plotContainer').append(htmlLine);
        }
        resizePlots();
    }

    $(document).on("click", ".projectItem" , function() {
        var projectId = $(this).attr('id');
        projectId = Number(projectId);
        selectedProject = projectId;
        refreshView();
    })

    function drawPlot()
    {
        var data = {
            datasets: [{
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    
                ],
                borderWidth: 1,
                label: 'Scatter Dataset',
                data: [{
                    x: -10,
                    y: 0
                }, {
                    x: 0,
                    y: 10
                }, {
                    x: 10,
                    y: 5
                }]
            }]
        }

        var ctx = document.getElementById('myChart');
        var scatterChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                scales: {
                    xAxes: [{
                        type: 'linear',
                        position: 'bottom'
                    }]
                }
            }
        });
    }
})

