$(function(){
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
        var plotH = Math.floor((plotW+20)*0.6);

        plotW = plotW.toString() + "px";
        plotH = plotH.toString() + "px";

        $('.plot').css({width: plotW, height: plotH});
    }

    resizePlots();
    window.addEventListener("resize", resizePlots);

    //opening projects
    var projects = [];
    var project = '';
    var selectedProject = -1;
    var charts = [];

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
        $("#fileIn").val('');
        selectedProject = projects.length-1;
        refreshView();
    })

    function refreshView()
    {
        var m_project = projects[selectedProject];
        $('#plotContainer').empty();
        charts = []
        for(var i = 1;i < m_project.length; i++)
        {
            var type = m_project[i].plot_type;
            if(type == "line")
            {
                var htmlLine = '<div class="plot" id = "plot'+ i.toString() +'"><canvas id="Chart'+ i.toString() +'" class="plotCanvas"></canvas></div>';
                $('#plotContainer').append(htmlLine);
                createPlot(i);
            }
            if(type == "text")
            {
                var htmlLine = '<div class="plot" id = "plot'+ i.toString() +'"> <pre id="Text'+ i.toString() +'" class="plotPre"> text</pre> </div>';
                $('#plotContainer').append(htmlLine);
                
                charts.push("#Text" + i.toString());
            }
            
        }
        resizePlots();
    }

    $(document).on("click", ".projectItem" , function() {
        var projectId = $(this).attr('id');
        projectId = Number(projectId);
        selectedProject = projectId;
        refreshView();
    })



    function createPlot(id)
    {
        var m_project = projects[selectedProject];
        var m_plot = m_project[id];

        var bgColor = 'rgba(255, 99, 132, 0.2)';
        if(m_plot.background_color != undefined){
            bgColor = m_plot.background_color
        }
        var boColor = 'rgba(255, 99, 132, 1)';
        if(m_plot.border_color != undefined){
            boColor = m_plot.border_color
        }

        var data = {
            datasets: [{
                backgroundColor: [bgColor],
                borderColor: [boColor],
                borderWidth: 1,
                label: m_plot.plot_name,
                data: []
            }]
        }
        var options = {
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: m_plot.x_axis_name
                    }

                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: m_plot.y_axis_name
                    }

                }]
            }
        }

        var ctx = document.getElementById('Chart'+ id.toString());
        charts.push(new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        }));
    }

    //data
    var last_project = -1;
    setInterval(function(){
        if(selectedProject != last_project)
        {
            last_project = selectedProject;
            var m_project = projects[selectedProject];
            var message = "[";
            for(var i = 1;i < m_project.length;i++)
            {
                message += '{"file" : "' + m_project[i].data_file + '", "type":"' + m_project[i].plot_type + '"}, ';
            }
            message = message.slice(0, message.length-2);
            message += "]";
            $.ajax
            ({
                type: "POST",
                url: 'data',
                dataType: 'json',
                async: true,
                data: JSON.stringify(message),
                contentType: 'application/json'
            })
        }
        if(selectedProject != -1)
        {
            fetch('/data')
            .then(function (response) {
                return response.text();
            }).then(function (text) {
                //console.log(text);
                var new_data = JSON.parse(JSON.parse(text));
                for(var i = 0; i < new_data.length;i++)
                {
                    var type = projects[selectedProject][i+1].plot_type;
                    if(type == "text")
                    {
                        //console.log(new_data[i]);
                        $(charts[i]).html(new_data[i]);
                    }
                    if(type == "line")
                    {
                        for(var j = 0;j < new_data[i].length;j++)
                        {
                            charts[i].data.datasets.forEach((dataset) => {
                                dataset.data.push(new_data[i][j]);
                            });
                            charts[i].update();
                        }
                    }
                }
            });
        }
        
    }, 2000);

    
})

