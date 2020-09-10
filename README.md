# DSboard
DSboard is an easy tool for live data visualization. I originali developed it for my machine learning projects, but it can be used for many other applications that require tracking data in real time.

## Usage
DSboard can be used by any programming language that can edit simple text files. If you are using python, a library will available that will create projects automaticly. For more informations and a tutorial read wiki or look at the example project.

## Instalation

For running the web app you need python3 installed. On linux it shoud be preinstalled. On windows go to https://www.python.org/ and download and install the latest version. When installing do not forget to add python to PATH. After that clone the repository and extract it. Go to extracted folder and create a virualenv

'''
python3 -m venv venv
'''

'''
source venv/bin/activate
'''

install flask
'''
pip install flask
'''

To start the application run dsboard.py
'''
python3 dsboard.py
'''

And then open localhost:5000 in your browser.
If everything was successfull you should see the main interface.

