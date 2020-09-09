import sys
from flask import Flask, render_template, request, redirect, Response
import random, json
import base64

plots = []
last = []
config_path = ""

app = Flask(__name__)
app.static_folder = 'static'

@app.route('/')
def output():
	return render_template('index.html')

@app.route('/data', methods=['GET', 'POST'])
def worker():
    global plots, last
    # POST request
    if request.method == 'POST':
        plots = json.loads(request.get_json())
        last = [0]*len(plots)
        return 'OK', 200

    # GET request
    else:
        message = '['
        for i in range(len(plots)):

            if plots[i].get("type") == "line":

                message += '['
                try:
                    f = open(plots[i].get("file"), "r") 
                    data = f.read()
                    data = data.strip()
                    data = data.split('\n')
                   
                    last_valid = -1
                    for j in range(last[i], len(data)):
                        line = data[j].split()
                        if len(line) != 2:
                            continue
                        last_valid = j
                        message+= '{"x": "' + line[0] + '", "y": "' + line[1] + '"},'
                    if last[i] != last_valid+1 and last_valid > -1:
                        last[i] = last_valid+1
                        message = message[:-1]
                    f.close()
                except:
                    pass
                message += '],'

            elif plots[i].get("type") == "text":
                message += '"'
                try:
                    f = open(plots[i].get("file"), "r")
                    data = f.read()
                    data = data.replace('\n', '<br>')
                    message+= data
                    f.close()
                except:
                    pass
                message += '",'
            
            elif plots[i].get("type") == "image":
                message += '"'
                try:
                    image_file = open(plots[i].get("file"), "rb")
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                    message+=encoded_string
                    image_file.close()
                except:
                    print("dadada")
                    pass
                message += '",'

        message = message[:-1]
        message += ']'
        return json.dumps(message)

@app.route('/control', methods=['GET', 'POST'])
def worker2():
    # POST request
    global config_path
    if request.method == 'POST':
        config_path = json.loads(request.get_json())
        print(config_path)
        return 'OK', 200

    # GET request
    else:
        with open(config_path, "r") as f:
            data = f.read()
            return json.dumps(data)
        return json.dumps("")
if __name__ == '__main__':
	app.run()  