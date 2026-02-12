from flask import Flask, render_template, request
import pandas as pd
import os
import json

app = Flask(__name__) # create a Flask instance
app.orders = pd.read_excel('../Sample - Superstore.xls') # load Superstore data

# TODO: load the superstore data into a pandas DataFrame
# orders = []
app.filtered_orders = app.orders
app.filters = {}
app.grouper = "Country/Region"
app.value = "Profit"
app.agg = "sum"

# TODO: define the groups, values, and aggregate functions that the user can select
groups = ["Country/Region", "Region", "State/Province"]
values = ["Quantity", "Sales", "Profit"]
aggs = ["sum", "mean", "variance", "count"]


# TODO: define a function for getting possible filter options for each grouper
def get_group_filters():
    return {
        "Country/Region": app.orders["Country/Region"].unique().tolist(),
        "Region": app.orders["Region"].unique().tolist(),
        "State/Province": app.orders["State/Province"].unique().tolist(),
    }

#    group_filters = ...
#    return group_filters

# TODO: define a function that returns the aggregated data
def get_aggregated_data():
    # initialize dataframe 
    df = app.filtered_orders
    # do group by by grouper, get value, the apply aggregation
    aggregated_data = df.groupby(app.grouper)[app.value].agg(app.agg)
    # jsonify ?
    aggregated_data = aggregated_data.reset_index()
    
    return aggregated_data


# Pass the groups, values, aggregate functions, and group filters to the root.html template
@app.route("/")
def root():
    return render_template(
        "root.html",
        groups=groups,
        values=values,
        aggs=aggs,
        group_filters=get_group_filters(),
    )

# @app.route("/do_something", methods=['POST'])
# def do_something():
#     request_data = request.get_json()
#     print(request_data)
#     option = request_data['option']
#     result = option in app.orders.columns
#     return {'result': result} # returns data

# TODO: Complete the update_aggregate
@app.route("/update_aggregate", methods=["POST"])
def update_aggregate():
    payload = request.get_json()
    value = payload.get('value')
    key = payload.get('key')

    if key == "x" and value in groups:
        app.grouper = value
    elif key == "y" and value in values:
        app.value = value
    elif key == "agg" and value in aggs:
        app.agg = value 
    
    return {'grouper': app.grouper, 'value': app.value, 'agg': app.agg}


# TODO: Complete the update_filter function
@app.route("/update_filter", methods=["POST"])
def update_filter():
    pass
    # ...
    # return {'group_filters': ..., 'data': ..., }


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)
