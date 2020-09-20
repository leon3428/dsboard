import sys
from flask import Flask, render_template, request, redirect, Response
import random, json
import base64
import os

config_path = ""
last_config_change = -1
project =[]
data_files = []
last_data_change = []

app = Flask(__name__)
app.static_folder = 'static'

@app.route('/')
def output():
	return render_template('index.html')

@app.route('/config', methods=['GET', 'POST'])
def worker2():
    # POST request
    global config_path, last_config_change, project, data_files, last_data_change
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
            data_files = []
            setDataFiles()
            last_data_change = [-1]*(len(project)-1)
            return json.dumps(project)
        else:
            return json.dumps("None")

@app.route('/data', methods=['GET', 'POST'])
def worker3():
    global data_files
    if request.method == 'POST':
        pass
    else:
        message = '['
        for df in data_files:
            print(df['file'])

    return json.dumps("None")

def setDataFiles():
    global data_files, project
    for i in range(1, len(project)):
        Ptype = project[i]['plot_type']
        if Ptype == 'chart':
            for line in project[i]['data']:
                df = {
                    "file": os.path.join(project[0]['project_folder'],line['data_file']),
                    "type": "chart",
                    "ind": i
                }
                data_files.append(df)
        if Ptype == 'text':
            df = {
                    "file": os.path.join(project[0]['project_folder'],project[i]['data_file']),
                    "type": "text",
                    "ind": i
                }
            data_files.append(df)
        if Ptype == 'image':
            df = {
                    "file": os.path.join(project[0]['project_folder'],project[i]['data_file']),
                    "type": "image",
                    "ind": i
                }
            data_files.append(df)

if __name__ == '__main__':
	app.run()  