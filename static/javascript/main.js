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

        var fontS = plotH*0.15*0.6;
        fontS = fontS.toString() + "px";
        $('.plotTitle').css({fontSize: fontS});

        plotW = plotW.toString() + "px";
        plotH = plotH.toString() + "px";

        $('.plot').css({width: plotW, height: plotH});
    }

    resizePlots();
    window.addEventListener("resize", resizePlots);

    $(document).on("click", ".projectItem" , function() {
        var projectId = $(this).attr('id');
        projectId = Number(projectId);
        selectedProject = projectId;
    })

    //opening projects
    var projects = [];
    var project = '';
    var selectedProject = -1;
    var plots = []

    $('#fileIn').change(function() { 
        var fr=new FileReader(); 
        fr.onload=function(){
            project = "error"
            try{
                project = JSON.parse(fr.result);
            }
            catch(err){} 
        } 
            
        fr.readAsText(this.files[0]); 
    })
    $('#btnSub').on('click', function(){
        if(project == "error")
        {
            $('#errorP').html('Selected file is not a valid project config file');
        } else{
            $('#errorP').html('');
            projects.push([]);
            var name = project[0].project_name;
            var id = projects.length-1;
            $('#projectsDropdown').append('<p class="dropdown-item projectItem" id="'+ id.toString() +'">' + name +'</p>');
            $("#browseModal .close").click();
            $("#fileIn").val('');
            message = '"' + project[0].project_folder + '"' 
            selectedProject = -1;
            $.ajax
            ({
                type: "POST",
                url: 'config',
                async: true,
                data: JSON.stringify(message),
                contentType: 'application/json',
                success: function(data) {
                    selectedProject = projects.length-1;
                }
            })
        }
    })

    //config
    function update_changes(new_config)
    {
        project = projects[selectedProject]
        n = Math.max(new_config.length, project.length)
        for(var i = 1;i < n;i++)
        {
            var flag = false
            if(JSON.stringify(new_config[i]) != JSON.stringify(project[i]) )
            {
                
                if(project[i] == undefined)
                {
                    //creating a new plot
                    flag = true;
                    var htmlLine = '<div class="plot" id = "plot'+ i.toString() +'"></div>';
                    $('#plotContainer').append(htmlLine);
                    htmlLine = '<div class="plotTitle", id="plotTitle' + i.toString() + '"> <div>title</div> </div>';
                    $('#plot' + i.toString()).append(htmlLine);
                    htmlLine = '<div class="plotBody" id="plotBody' + i.toString() + '"></div>';
                    $('#plot' + i.toString()).append(htmlLine);
                } else if(new_config[i] == undefined)
                {
                    //deleting a plot
                    plots.pop();
                    $('#plot'+i.toString()).remove();
                } else {
                    $('#plotBody'+i.toString()).empty();
                }
                if(new_config[i] != undefined)
                {
                    addContent(i, new_config[i]);
                }
            }
            if(flag) {
                resizePlots();
            }
        }
        projects[selectedProject] = new_config;
    }

    function addContent(ind, plotConfig){
        var type = plotConfig.plot_type;
        var plot = ''
        if(type == "chart")
        {
            var htmlLine = '<canvas id="Chart'+ ind.toString() +'" class="plotCanvas"></canvas>';
            $('#plotBody' + ind.toString()).append(htmlLine);
            $('#plotTitle' + ind.toString()).html(plotConfig.plot_name)
            plot = createChart(ind, plotConfig);
        }
        if(type == "text")
        {
            var htmlLine = '<pre id="Text'+ ind.toString() +'" class="txtPlot"> text</pre>';
            $('#plotBody' + ind.toString()).append(htmlLine);
            $('#plotTitle' + ind.toString()).html(plotConfig.plot_name)
            plot = "#Text" + ind.toString();
        }
        if(type =="image")
        {
            var htmlLine = '<img src="#" id="Image'+ ind.toString() + '" class="imgPlot">';
            $('#plotBody' + ind.toString()).append(htmlLine);
            $('#plotTitle' + ind.toString()).html(plotConfig.plot_name)
            plot = "#Image" + ind.toString();
        }
        if(ind-1 < plots.length){
            plots[ind-1] = plot
        } else {
            plots.push(plot)
        }
    }

    const COLORS = ["255, 163, 0", "227, 89, 208", "51, 185, 242", "230, 191, 0", "66, 191, 59", "182, 58, 240", "19, 168, 254", "207, 0, 96"];

    function createChart(ind, plotConfig){
        var data = {
            datasets: []
        };
        for(var i = 0;i < plotConfig.data.length;i++)
        {
            var colorId = i%COLORS.length;
            var line = plotConfig.data[i];
            line = {
                borderWidth: 2,
                data: [],
                last_line: 0,
                fill: line.fill == undefined ? false : line.fill,
                backgroundColor: line.color == undefined ? 'rgba(' + COLORS[colorId] + ', 0.3)' : 'rgba(' + line.color + ',0.3)',
                borderColor: line.color == undefined ? 'rgba(' + COLORS[colorId] + ', 1)' : 'rgba(' + line.color + ',1)',
                lineTension: line.line_tension == undefined ? 0.4 : line.line_tension,
                label: line.label == undefined ? '' : line.label
            };
            data.datasets.push(line);
        }
        var options = {
            maintainAspectRatio: false,
            legend: {
                display: true
            },
            
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: plotConfig.x_axis.label
                    },
                    ticks: {
                        beginAtZero: plotConfig.x_axis.begin_at_zero == undefined ? true : plotConfig.x_axis.begin_at_zero
                    }

                }],
                yAxes: [{
                    type: 'linear',
                    scaleLabel: {
                        display: true,
                        labelString: plotConfig.y_axis.label
                    },
                    ticks: {
                        beginAtZero: plotConfig.y_axis.begin_at_zero == undefined ? true : plotConfig.y_axis.begin_at_zero
                    }
                   

                }]
            }
        }

        var ctx = document.getElementById('Chart'+ ind.toString());
        chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
        return chart;
    }

    setInterval(function(){
        fetch('/config')
        .then(function (response) {
            return response.text();
        }).then(function (text) {
            var new_config = JSON.parse(text);
            
            
            if(new_config != 'None')
            {
                if(Array.isArray(new_config)){
                    update_changes(new_config)
                } else {
                    $('.toast').toast('show');  
                }
                
            }
        });
    }, 2000);

    function switchData(){
        data_hlt = !data_hlt
        $.ajax
        ({
            type: "POST",
            url: 'data',
            async: true,
            data: JSON.stringify(data_hlt),
            contentType: 'application/json'
        })
    }

    var data_hlt = true;
    //data
    setInterval(function(){
        if(selectedProject != -1)
        {
            if(data_hlt)
            {
                switchData();
            }
            
            fetch('/data')
            .then(function (response) {
                return response.text();
            }).then(function (text) {
                var new_data = JSON.parse(text);
                try{
                    new_data = JSON.parse(new_data);
                } 
                catch(err){}
                //console.log(new_data);
               
                for(var i = 0;i < new_data.length;i++)
                {
                    var type = projects[selectedProject][i+1].plot_type;
                    if(type == "text")
                    {
                        if(new_data[i] != 'None')
                            $(plots[i]).html(new_data[i]);
                    }
                    if(type == "chart")
                    {
                        for(var j=0; j < new_data[i].length;j++)
                        {
                            if(new_data[i][j] == 'None')
                                continue;
                            data = JSON.parse(new_data[i][j]);
                            if(data.length < plots[i].data.datasets[j].last_line)
                            {
                                plots[i].data.datasets[j].last_line = 0;
                                plots[i].data.datasets[j].data = [];
                            }
                            for(var k = plots[i].data.datasets[j].last_line; k < data.length; k++)
                            {
                                var point = {
                                    x: data[k][0],
                                    y: data[k][1]
                                };
                                plots[i].data.datasets[j].data.push(point);
                            }
                            plots[i].data.datasets[j].last_line = data.length;
                        }
                        plots[i].update();

                    }
                    if(type == "image")
                    {
                        if(new_data[i] != "None")
                        {
                            var format = projects[selectedProject][i+1].data_file.slice(-3);
                            if(format == "jpg")
                            {
                                format = "jpeg"
                            }
                            $(plots[i]).attr("src", "data:image/" + format + ";base64, " + new_data[i]);
                        }
                        
                    }
                }
                
            });
        } else {
            if(!data_hlt)
            {
                switchData();
            }
        }
        
    }, 2000);


})

