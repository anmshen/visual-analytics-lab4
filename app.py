from flask import Flask, render_template, request
import pandas as pd

app = Flask(__name__)

# DONE: load the superstore data into a pandas DataFrame
orders = pd.read_excel("Sample - Superstore.xls", engine="xlrd")
app.filtered_orders = orders
app.filters = {"Country/Region": "All", "Region": "All", "State/Province": "All"}
app.grouper = "Country/Region"
app.value = "Profit"
app.agg = "sum"

# DONE: define the groups, values, and aggregate functions that the user can select
groups = ["Country/Region", "Region", "State/Province"]
values = ["Quantity", "Sales", "Profit"]
aggs = ["sum", "mean", "variance", "count"]

# Helper function to apply the filters to the dataset and update the filtered_orders variable
def apply_filters():
    df = orders.copy()

    for col, val in app.filters.items():
        if val != "All":
            df = df[df[col] == val]

    app.filtered_orders = df

# DONE: define a function for getting possible filter options for each grouper
def get_group_filters():
    df = app.filtered_orders

    # print("filtered df shape: ", df.shape)
    #print("columns", df.columns.tolist())

    group_filters = {}

    # iterate over "Country/Region", "Region", "State/Province" and 
    # get the unique values for each column in the filtered dataset, and add "All" as an option
    for group in groups:
        options = sorted(df[group].unique().tolist())
        group_filters[group] = ["All"] + options

    return group_filters



# DONE: define a function that returns the aggregated data
def get_aggregated_data():
    df = app.filtered_orders # get the full dataset

    # assign variables to group by column, value column, and aggregate function
    g = app.grouper
    v = app.value
    a = app.agg

    # group by the selected column and apply the selected aggregate function
    if a == "count":
        out = df.groupby(g).size().reset_index(name=v)
    elif a == "variance":
        out = df.groupby(g)[v].var(ddof=0).reset_index()
    elif a == "mean":
        out = df.groupby(g)[v].mean().reset_index()
    else:  # "sum"
        out = df.groupby(g)[v].sum().reset_index()

    return out.to_dict(orient="records")



# Pass the groups, values, aggregate functions, and group filters to the root.html template
@app.route("/")
def root():
    apply_filters()
    gv = get_group_filters()

    return render_template(
        "root.html",
        groups=groups,
        values=values,
        aggs=aggs,
        group_values=gv,
        group_filters=gv # I think we might need to change this line later
    )


# DONE: Complete the update_aggregate
@app.route("/update_aggregate", methods=["POST"])
def update_aggregate():
    payload = request.get_json(force=True) or {}
    value = payload.get("value", None)
    key = payload.get("key", None)

    # update the app state with the new aggregate function
    if key in ["grouper", "value", "agg"] and value is not None:
        if key == "grouper":
            app.grouper = value
        elif key == "value":
            app.value = value
        elif key == "agg":
            app.agg = value
    
        # ensure that when x-axis, y-axis, or aggregate changes, all filters reset to "All"
        for k in app.filters:
            app.filters[k] = "All"
     
    # apply filters and get results   
    apply_filters()
    gf = get_group_filters()
    data = get_aggregated_data()

    return {
        "data": data,
        "x_column": app.grouper,
        "y_column": app.value,
        "group_filters": gf
    }
    
    # data = get_aggregated_data()
    # return {"data": data, "x_column": app.grouper, "y_column": app.value}
    

# DONE: Complete the update_filter function
@app.route("/update_filter", methods=["POST"])
def update_filter():
    payload = request.get_json(force=True) or {}
    value = payload.get("value", None)
    key = payload.get("key", None)

    # update the app state with the new filter values
    if key in app.filters and value is not None:
        app.filters[key] = value
    
    # if the user picks a state, then the country and region should get automatically updated
    if key == "State/Province" and value is not None and value != "All":
        row = orders[orders["State/Province"] == value].head(1)
        if not row.empty:
            app.filters["Country/Region"] = row["Country/Region"].iloc[0]
            app.filters["Region"] = row["Region"].iloc[0]

    # apply the filters
    apply_filters()

    # update new possible dropdown options 
    gf = get_group_filters()

    # if current selections are no longer valid (because they got filtered out), reset them to All
    for k in ["Country/Region", "Region", "State/Province"]:
        if app.filters[k] not in gf[k]:
            app.filters[k] = "All"
    apply_filters()
    gf = get_group_filters()

    data = get_aggregated_data()
    return {"group_filters": gf, "data": data, "x_column": app.grouper, "y_column": app.value}


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000)
