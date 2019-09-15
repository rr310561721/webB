from routes import (
    AyuTemplate,
    html_response,
    login_required,
)
from utils import log
from routes import json_response, current_user
from models.weibo import Weibo
from models.user import User
from models.comment import Comment


def index(request):
    """
    weibo 首页的路由函数
    """
    u = current_user(request)
    weibos = Weibo.find_all(user_id=u.id)
    # 替换模板文件中的标记字符串
    body = AyuTemplate.render('weibo_index.html', weibos=weibos, user=u)
    return html_response(body)


# 本文件只返回 json 格式的数据
# 而不是 html 格式的数据
def all(request):
    weibos = Weibo.all_json()
    for weibo in weibos:
        # 用该函数拿到指定数据的字典
        weibo = useful_weibos(weibo)
    # log('routes all 函数 weibos', weibos)
    return json_response(weibos)


def useful_weibos(weibo):
    """
    该函数的作用是拿到该微博评论数据 ，拼成一个字典
    """
    user = User.find_by(id=weibo['user_id'])
    weibo['username'] = user.username
    # 拿到该微博的所有评论
    comments = Comment.find_all(weibo_id=weibo['id'])
    # 拿到评论者的名字，并加入到comment中
    log('useful_weibos 函数 comments 数据', comments)
    comments = [c.__dict__ for c in comments]
    for c in comments:
        comment_user = User.find_by(id=c['user_id'])
        c['username'] = comment_user.username
    # 把评论comment加入weibo字典里
    weibo['comments'] = comments
    return weibo


def add(request):
    # 得到浏览器发送的表单, 浏览器用 ajax 发送 json 格式的数据过来
    # 所以这里我们用新增加的 json 函数来获取格式化后的 json 数据
    form = request.json()

    u = current_user(request)
    w = Weibo.add(form, u.id)
    w = w.json()
    # 用该函数拿到指定数据的字典
    weibo = useful_weibos(w)

    return json_response(weibo)


def delete(request):
    weibo_id = int(request.query['id'])
    Weibo.delete(weibo_id)
    comment = Comment.find_all(weibo_id=weibo_id)

    # 循环删除
    for i in comment:
        Comment.delete(int(i.id))

    d = dict(
        message="成功删除 weibo"
    )
    return json_response(d)


def update(request):
    """
    用于更新 weibo 的路由函数
    """
    form = request.json()
    log('api weibo update form', form)
    t = Weibo.update(**form)
    return json_response(t.json())


def comment_add(request):
    u = current_user(request)
    form = request.json()
    log('api comment_add form', form)
    w = Weibo.find_by(id=int(form['weibo_id']))
    c = Comment(form)
    c.user_id = u.id
    c.weibo_id = w.id
    c.save()
    c = c.json()

    # 在comment数据里加上评论用户名
    c['username'] = u.username

    return json_response(c)


def comment_delete(request):
    comment_id = int(request.query['id'])
    Comment.delete(comment_id)
    d = dict(
        message="成功删除 comment"
    )
    return json_response(d)


def comment_update(request):
    """
    用于更新 comment 的路由函数
    """
    form = request.json()
    log('api comment update form', form)
    t = Comment.update(**form)
    return json_response(t.json())


def weibo_owner_required(route_function):
    """
    该函数用来判断用户是否有权限更改微博
    """
    def f(request):
        log('weibo_owner_required')
        u = current_user(request)
        if 'id' in request.query:
            weibo_id = int(request.query['id'])
        else:
            form = request.json()
            weibo_id = int(form['id'])

        t = Weibo.find_by(id=weibo_id)
        if t.user_id == u.id:
            return route_function(request)
        else:
            d = dict(
                message="还想改别人的微博？"
            )
            return json_response(d)

    return f


def comment_owner_required(route_function):
    """
    该函数用来判断用户是否有权限更改评论
    """
    def f(request):
        log('comment_owner_required')
        u = current_user(request)
        if 'id' in request.query:
            comment_id = int(request.query['id'])
        else:
            form = request.json()
            comment_id = int(form['id'])

        t = Comment.find_by(id=comment_id)
        weibo_id = t.weibo_id
        w = Weibo.find_by(id=weibo_id)

        if t.user_id == u.id or w.user_id == u.id:
            return route_function(request)
        else:
            d = dict(
                message="还想改别人的评论？"
            )
            return json_response(d)

    return f


def route_dict():
    """
    路由字典
    key 是路由(路由就是 path)
    value 是路由处理函数(就是响应)
    """
    d = {
        '/weibo/index': login_required(index),
        '/weibo/all': all,
        '/weibo/add': add,
        '/weibo/delete': weibo_owner_required(delete),
        '/weibo/update': weibo_owner_required(update),
        '/comment/add': comment_add,
        '/comment/delete': comment_owner_required(comment_delete),
        '/comment/update': comment_owner_required(comment_update),
    }
    return d






