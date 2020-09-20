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
            selectedProject = projects.length-1;
            message = '"' + project[0].project_folder + '"' 
            $.ajax
            ({
                type: "POST",
                url: 'config',
                dataType: 'json',
                async: true,
                data: JSON.stringify(message),
                contentType: 'application/json'
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
        if(ind < plots.length){
            plots[ind] = plot
        } else {
            plots.push(plot)
        }
    }

    function createChart(ind, plotConfig){
        var data = {
            datasets: []
        };
        for(var i = 0;i < plotConfig.data.length;i++)
        {
            line = {
                borderWidth: 1,
                data: []
            }
            data.datasets.push(line);
        }
        var options = {
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: plotConfig.x_axis_label
                    }

                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: plotConfig.y_axis_label
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
            console.log(new_config);
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

    //data
    setInterval(function(){
        fetch('/data')
        .then(function (response) {
            return response.text();
        }).then(function (text) {
            var new_data = JSON.parse(text);
            console.log(new_data);
        });
    }, 2000);


})

