import sys
from flask import Flask, render_template, request, redirect, Response
import random, json
import base64
import os

config_path = ""
last_config_change = -1
project = []

app = Flask(__name__)
app.static_folder = 'static'
last_data_change = []

@app.route('/')
def output():
	return render_template('index.html')

@app.route('/config', methods=['GET', 'POST'])
def worker2():
    # POST request
    global config_path, last_config_change, project, last_data_change
    if request.method == 'POST':
        config_path = os.path.join(json.loads(request.get_json()), 'config.json')
        last_config_change = -1
        last_data_change = []
        return 'OK', 200
    #GET request
    else:
        try:
            t = os.stat(config_path).st_mtime
        except:
            return json.dumps("None")
        if t != last_config_change:
            last_config_change = t

            data = ""
            try:
                f = open(config_path, "r")
                data = json.load(f)
                f.close()
                project = data
                
            except:
                return json.dumps("None")
            last_data_change = []

            return json.dumps(project)
        else:
            return json.dumps("None")

@app.route('/data', methods=['GET', 'POST'])
def worker3():
    global last_data_change, project

    if request.method == 'POST':
        return 'OK', 200
    else:
        message = '['
        if len(project)-1 != len(last_data_change):
            last_data_change = [-1]*(len(project)-1)

        for i in range(1,len(project)):
            Ptype = project[i]['plot_type']
            if Ptype == 'chart':
                message += '['
                if last_data_change[i-1] == -1:
                    last_data_change[i-1] = [-1]*len(project[i]['data'])
                for j in range(len(project[i]['data'])):
                    df = os.path.join(project[0]['project_folder'], project[i]['data'][j]['data_file'])
                    try:
                        t = os.stat(df).st_mtime
                    except:
                        return json.dumps("None")
                    #print(last_data_change)
                    if t != last_data_change[i-1][j]:
                        last_data_change[i-1][j] = t
                        data = ""
                        try:
                            f = open(df, "r")
                            data = f.read()
                            f.close()
                        except:
                            return json.dumps("None")
                        data = data.replace('\n', '')
                        data = data.replace(' ', '')
                        data = data.replace('/', '],[')
                        data = data[:-2]
                        message += '"[[' + data + ']",'
                    else:
                        message += '"None",'
                message = message[:-1]
                message += '],'
            if Ptype == 'text':
                df = os.path.join(project[0]['project_folder'], project[i]['data_file'])
                try:
                    t = os.stat(df).st_mtime
                except:
                    return json.dumps("None")
                if t != last_data_change[i-1]:
                    last_data_change[i-1] = t
                    data = ""
                    try:
                        f = open(df, "r")
                        data = f.read()
                        f.close()
                    except:
                        return json.dumps("None")
                    data = data.replace('\n', '<br>')
                    message += '"' + data + '",'
                else:
                    message += '"None",'
            if Ptype == 'image':
                df = os.path.join(project[0]['project_folder'], project[i]['data_file'])
                try:
                    t = os.stat(df).st_mtime
                except:
                    return json.dumps("None")
                if t != last_data_change[i-1]:
                    last_data_change[i-1] = t
                    data = ""
                    try:
                        f = open(df, "rb")
                        data = base64.b64encode(f.read()).decode('utf-8')
                        f.close()
                    except:
                        return json.dumps("None")
                    message += '"' + data + '",'
                else:
                    message += '"None",'
                

            
        message = message[:-1]
        message += ']'
        return json.dumps(message)



if __name__ == '__main__':
	app.run()  