import sys
from flask import Flask, render_template, request, redirect, Response
import random, json
import base64

plots = []
last = []

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
                f = open(plots[i].get("file"), "r")
                data = f.read()
                data = data.split('\n')
                if len(data) == last[i]:
                    message += '[],'
                    continue
                message += '['
                for j in range(last[i], len(data)):
                    line = data[j].split()
                    if len(line) != 2:
                        continue
                    message+= '{"x": "' + line[0] + '", "y": "' + line[1] + '"},'
                last[i] = len(data)
                message = message[:-1]
                message+='],'

            elif plots[i].get("type") == "text":
                f = open(plots[i].get("file"), "r")
                data = f.read()
                data = data.replace('\n', '<br>')
                message+='"' + data + '",'
            
            elif plots[i].get("type") == "image":
                with open(plots[i].get("file"), "rb") as image_file:
                    encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                    message+='"' + encoded_string + '",'

        message = message[:-1]
        message += ']'
        return json.dumps(message)



if __name__ == '__main__':
	app.run()  