from flask import Flask, render_template, request
import pandas as pd
import os
import json

app = Flask(__name__) # create a Flask instance
app.orders = pd.read_excel('../Sample - Superstore.xls') # load Superstore data

@app.route("/") # endpoint: map url to python function (root url of our application -> root)
def root():
    return render_template(
        'root.html', options=['Order ID', 'dog', 'cat', 'bird']
    ) # returns html

@app.route("/do_something", methods=['POST'])
def do_something():
    request_data = request.get_json()
    print(request_data)
    option = request_data['option']
    result = option in app.orders.columns
    return {'result': result} # returns data

if __name__ == '__main__':
    app.run(debug=True)