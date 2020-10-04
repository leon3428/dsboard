# DSboard
DSboard is a web app for data visualization focused on making live data visualization as easy as possible. All communication with the web app is done through simple text files which makes DSboard compatible with almost every programming language. If you are using python, a library, that makes the process of creating projects even easier is coming soon. For more information check the wiki.

## Instalation

For running the web app you need python3 installed. On linux, it should be preinstalled. On windows, go to https://www.python.org/ and download and install the latest version. When installing do not forget to add python to PATH. Download the latest release of DSboard and extract it. Go to the extracted folder and create a virualenv

```
python3 -m venv venv
```
Activate the virualenv(you have to activate it every time that you open a new terminal window)
```
source venv/bin/activate
```

install flask
```
pip install flask
```

To start the application run dsboard.py
```
python3 dsboard.py
```

And then open localhost:5000 in your browser.
If everything was successful you should see the main interface.

