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
        $('.plotTitle div').css({fontSize: fontS});

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
            projects.push(project);
            var name = project[0].project_name;
            var id = projects.length-1;
            $('#projectsDropdown').append('<p class="dropdown-item projectItem" id="'+ id.toString() +'">' + name +'</p>');
            $("#browseModal .close").click();
            $("#fileIn").val('');
            selectedProject = projects.length-1;
            refreshView();
        }
    })

    function refreshView()
    {
        var m_project = projects[selectedProject];
        $('#plotContainer').empty();
        charts = []
        for(var i = 1;i < m_project.length; i++)
        {
            var type = m_project[i].plot_type;
            var htmlLine = '<div class="plot" id = "plot'+ i.toString() +'"></div>';
            $('#plotContainer').append(htmlLine);
            htmlLine = '<div class="plotTitle", id="plotTitle' + i.toString() + '"> <div>' + m_project[i].plot_name + '</div> </div>';
            $('#plot' + i.toString()).append(htmlLine);
            htmlLine = '<div class="plotBody" id="plotBody' + i.toString() + '"></div>'
            $('#plot' + i.toString()).append(htmlLine);

            if(type == "line")
            {
                var htmlLine = '<canvas id="Chart'+ i.toString() +'" class="plotCanvas"></canvas>';
                $('#plotBody' + i.toString()).append(htmlLine);
                createPlot(i);
            }
            if(type == "text")
            {
                var htmlLine = '<pre id="Text'+ i.toString() +'" class="txtPlot"> text</pre>';
                $('#plotBody' + i.toString()).append(htmlLine);
                charts.push("#Text" + i.toString());
            }
            if(type =="image")
            {
                var htmlLine = '<img src="#" id="Image'+ i.toString() + '" class="imgPlot">';
                $('#plotBody' + i.toString()).append(htmlLine);
                charts.push("#Image" + i.toString());
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

    function refreshSend(){

        // returns a promise that can be used later. 
        message = '"' + projects[selectedProject][0].project_config + '"';
        return $.ajax
        ({
            type: "POST",
            url: 'control',
            dataType: 'json',
            async: true,
            data: JSON.stringify(message),
            contentType: 'application/json'
        })
    }
      

    $('#refreshBtn').on("click", function(){
        if(selectedProject == -1)
        {
            return;
        }
        refreshSend().then(function(data) {
            // Run this when your request was successful
            //console.log(data)
        }).catch(function(err) {
        // Run this when promise was rejected via reject()
            //console.log(err)
            fetch('/control')
            .then(function (response) {
                return response.text();
            }).then(function (text) {
                //console.log(text);
                var new_data = JSON.parse(text);
                try{
                    new_data = JSON.parse(new_data);
                } 
                catch(err){

                }
                //console.log(new_data);
                projects[selectedProject] = new_data
                last_project = -1
                refreshView();
            });
        })
        
     

        
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
        var linet = 0.4
        if(m_plot.line_tension != undefined){
            linet = m_plot.line_tension;
        }

        var data = {
            datasets: [{
                lineTension: linet,
                backgroundColor: [bgColor],
                borderColor: [boColor],
                borderWidth: 1,
                data: []
            }]
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
                        labelString: m_plot.x_axis_label
                    }

                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: m_plot.y_axis_label
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
                var new_data = JSON.parse(text);
                try{
                    new_data = JSON.parse(new_data);
                } 
                catch(err){

                }
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
                    if(type == "image")
                    {
                        if(new_data[i] == "")
                        {
                            continue;
                        }
                        var format = projects[selectedProject][i+1].data_file.slice(-3);
                        if(format == "jpg")
                        {
                            format = "jpeg"
                        }
                        $(charts[i]).attr("src", "data:image/" + format + ";base64, " + new_data[i]);
                    }
                }
            });
        }
        
    }, 2000);

    
})

