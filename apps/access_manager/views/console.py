from vela.template_engine.engine import render_template
def console_view(params): return render_template("apps/access_manager/templates/index.html",context={"app_name":"Access Manager"},router=params["router"])
