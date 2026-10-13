from apps.access_manager.views.console import console_view
def register_routes(router):
    router.add("/",console_view,name="access_manager",title="Access Manager",icon="",layout="blank",show_in_sidebar=False)
