---
id: flaskapis
title: Flask REST API (Family)
goals: Build REST endpoints in Flask with routes, URL converters, request.get_json and jsonify; Keep data behind a class with methods so routes stay thin; Test endpoints with pytest and Flask's test client; Review your own older code honestly: status codes, validation, ids and lookups; Explain the project clearly in an interview
prereqs: Python basics (classes, dictionaries, lists)
---

## Session: The Family API: routes and a data class

## Step: What a REST API is, and the Family API
kind: read
time: 12

A **REST API** is a set of web addresses (endpoints) that other programs call to read and change data. Each endpoint is a **method** plus a **path**:

| Method | Means | Example |
|---|---|---|
| GET | read | `GET /members` |
| POST | create | `POST /member` with a JSON body |
| PUT / PATCH | change | `PUT /member/3` |
| DELETE | remove | `DELETE /member/3` |

The answer is JSON plus a **status code**: 200 OK, 201 Created, 400 Bad Request, 404 Not Found.

In this guide you'll walk through the [**Family Static API**](https://github.com/TheoYanvno/Family-APi), an API I built in 2023: the members of the "Jackson" family, kept in a Python class instead of a database.

It's an early project, and the last session reviews it the way a senior developer would. Knowing what you'd fix in your own old code is one of the best things you can show in an interview.

```svg A REST call: the client sends a method and a path with an optional JSON body; Flask finds the matching route function, which answers with JSON and a status code
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 130" font-family="sans-serif" font-size="12">
  <rect width="560" height="130" fill="#ffffff"/>
  <rect x="10" y="40" width="130" height="50" rx="8" fill="#f3f4f6" stroke="#6b7280"/><text x="75" y="62" text-anchor="middle">Postman, a page,</text><text x="75" y="78" text-anchor="middle">another program</text>
  <rect x="210" y="40" width="140" height="50" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="280" y="62" text-anchor="middle" font-weight="bold">Flask route</text><text x="280" y="78" text-anchor="middle">@app.route(...)</text>
  <rect x="420" y="40" width="130" height="50" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="485" y="62" text-anchor="middle" font-weight="bold">data</text><text x="485" y="78" text-anchor="middle">class or database</text>
  <text x="175" y="30" text-anchor="middle">POST /member</text><path d="M140 55 H206" stroke="#374151" stroke-width="2"/>
  <text x="175" y="112" text-anchor="middle">JSON + 201</text><path d="M206 80 H140" stroke="#374151" stroke-width="2"/>
  <path d="M350 65 H416" stroke="#374151" stroke-width="2"/>
</svg>
```

To run it on Windows: `pip install flask flask-cors pytest`, then `python src/app.py`. The academy template also works with `pipenv install` and `pipenv run start`.

quiz: Which method and path would you use to remove member 7?
- [ ] GET /member/7
- [ ] POST /member/7
- [x] DELETE /member/7
why: The method says what to do and the path says what to do it to.

quiz: What status code means "the thing you asked for doesn't exist"?
- [ ] 200
- [ ] 201
- [x] 404
why: 404 Not Found. 200 means OK, 201 means something was created.

## Step: The FamilyStructure class
kind: read
time: 15

`src/datastructures.py` keeps the members in a list that only the class's methods touch:

```python
from random import randint

class FamilyStructure:
    def __init__(self, last_name):
        self.last_name = last_name
        self._members = []

    def _generateId(self):
        return randint(0, 99999999)

    def add_member(self, member):
        if "id" not in member:
            member["id"] = self._generateId()
        self._members.append(member)

    def delete_member(self, id):
        self._members = list(filter(lambda member: member["id"] != id, self._members))

    def get_member(self, id):
        return list(filter(lambda member: member["id"] == id, self._members))

    def get_all_members(self):
        return self._members
```

- **`_members` starts with an underscore**: Python's convention for "private, use the methods". The routes never touch the list directly.
- **`add_member`** gives a new member an id only if it doesn't have one.
- **`delete_member`** builds a new list without that id. `filter(fn, items)` keeps the items where `fn` returns True.
- **`get_member`** returns a **list** of matches: empty if there's none, one member if there is.

### Why put data behind a class?

The routes only call methods. If the family moved into a database tomorrow, you'd rewrite the class and the routes wouldn't change. That's **encapsulation**, and it's the same idea as keeping all the SQL in one store module.

```svg The routes only call FamilyStructure's methods; the list of members stays inside the class, so changing how it's stored never touches the routes
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 140" font-family="sans-serif" font-size="12">
  <rect width="560" height="140" fill="#ffffff"/>
  <rect x="10" y="20" width="150" height="100" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="85" y="45" text-anchor="middle" font-weight="bold">app.py routes</text><text x="85" y="68" text-anchor="middle">GET /members</text><text x="85" y="86" text-anchor="middle">POST /member</text><text x="85" y="104" text-anchor="middle">DELETE /member/&lt;id&gt;</text>
  <rect x="220" y="10" width="320" height="120" rx="10" fill="#fff7ed" stroke="#f59e0b"/><text x="380" y="30" text-anchor="middle" font-weight="bold">FamilyStructure("Jackson")</text>
  <rect x="235" y="45" width="140" height="70" rx="6" fill="#ffffff" stroke="#f59e0b"/><text x="305" y="65" text-anchor="middle">add_member</text><text x="305" y="82" text-anchor="middle">get_member</text><text x="305" y="99" text-anchor="middle">delete_member</text>
  <rect x="395" y="45" width="130" height="70" rx="6" fill="#e5e7eb" stroke="#374151"/><text x="460" y="75" text-anchor="middle">_members</text><text x="460" y="92" text-anchor="middle">(private list)</text>
  <path d="M160 70 H231 M375 80 H391" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: What does get_member return when no member has that id?
- [ ] None
- [x] An empty list
- [ ] It raises an error
why: filter keeps only matches, so with none you get list() of nothing: []. The route has to check the length.

quiz: What's the benefit of the routes only calling the class's methods?
- [x] How the members are stored can change without touching the routes
- [ ] It makes the API faster
- [ ] Flask requires a class for data
why: Encapsulation puts one boundary around the data. Everything else depends on the methods, not the list.

## Step: The routes: get_json, jsonify and URL converters
kind: read
time: 15

`src/app.py` creates the family, adds three members and defines the endpoints:

```python
app = Flask(__name__)
app.url_map.strict_slashes = False
CORS(app)

jackson_family = FamilyStructure("Jackson")
jackson_family.add_member({"first_name": "John", "age": "33", "lucky_number": [7, 13, 22]})

@app.route("/members", methods=["GET"])
def handle_get_all_members():
    return jsonify(jackson_family.get_all_members()), 200

@app.route("/member", methods=["POST"])
def handle_add_member():
    data = request.get_json()
    jackson_family.add_member(data)
    return jsonify(data), 200

@app.route("/member/<int:member_id>", methods=["GET"])
def handle_get_member(member_id):
    member = jackson_family.get_member(member_id)
    if len(member) > 0:
        return jsonify(member[0]), 200
    return jsonify({}), 200
```

- **`@app.route(path, methods=[...])`** connects a method and path to a function.
- **`<int:member_id>`** is a **URL converter**: `/member/42` calls the function with `member_id=42` as an int, and `/member/abc` is a 404 before your code runs.
- **`request.get_json()`** reads the JSON body as a dict.
- **`jsonify(...)`** turns dicts and lists into a JSON response. Returning `(response, 200)` sets the status code.
- **`strict_slashes = False`** makes `/members` and `/members/` the same.
- **`CORS(app)`** lets a web page on another address call the API from the browser.

### Testing it

The academy's tests use **pytest** and Flask's test client:

```python
def test_first_three(client):
    response = client.get("/members")
    members = json.loads(response.data)
    assert len(members) == 3
```

You can also try every endpoint in Postman, or from PowerShell:

```text
Invoke-RestMethod http://localhost:3000/members
Invoke-RestMethod -Method Post -Uri http://localhost:3000/member -ContentType "application/json" -Body '{"first_name":"Tommy","age":23}'
```

quiz: What does <int:member_id> in a route do?
- [ ] Makes member_id optional
- [x] Takes that part of the path, turns it into an int and passes it to the function; non-numbers don't match
- [ ] Limits the id to 3 digits
why: Converters validate and convert path parts before your function runs.

quiz: What does CORS(app) allow?
- [ ] Any program to change the code
- [x] A web page served from another address to call this API from the browser
- [ ] Requests without JSON
why: Browsers block cross-origin requests unless the server says they're allowed. Postman and scripts aren't affected.

## Session: Reviewing and growing the Family API

## Step: Reviewing my own code
kind: read
time: 20

This is a 2023 project. Reviewing it honestly is great interview material: "here's what I built, and here's what I'd change now". Each fix is small.

### 1. Status codes

`GET /member/<id>` answers `{}` with **200** when there's no such member, and adding a member answers 200 instead of **201**. Better:

```python
member = jackson_family.get_member(member_id)
if not member:
    return jsonify({"error": f"No member with id {member_id}"}), 404
return jsonify(member[0]), 200
```

### 2. Validate the body

`request.get_json()` returns `None` when the body is missing or isn't JSON, and `add_member` happily stores a member with no name. Check first and answer **400** with every problem listed:

```python
data = request.get_json(silent=True)
if not isinstance(data, dict):
    return jsonify({"error": "Send a JSON object"}), 400
problems = [f"{field} is required" for field in ("first_name", "age") if field not in data]
if problems:
    return jsonify({"errors": problems}), 400
```

### 3. Ids that can't collide

`randint(0, 99999999)` can give two members the same id. A counter can't:

```python
self._next_id = 1

def _generateId(self):
    new_id = self._next_id
    self._next_id += 1
    return new_id
```

### 4. A dictionary instead of a list

`get_member` and `delete_member` scan the whole list every time. Keying members by id makes each lookup one step, and "not found" becomes a plain `None`:

```python
self._members = {}                       # id -> member

def get_member(self, id):
    return self._members.get(id)

def delete_member(self, id):
    return self._members.pop(id, None) is not None
```

### 5. Delete should say what happened

`DELETE /member/<id>` answers `{"done": True}` even for a member that never existed. With `delete_member` returning True or False, the route can answer 200 or 404.

```svg A review checklist for the Family API: the right status codes, validated input, ids that can't collide, lookups by key, and deletes that report what happened
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" font-family="sans-serif" font-size="12">
  <rect width="560" height="120" fill="#ffffff"/>
  <rect x="5" y="35" width="105" height="55" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="57" y="60" text-anchor="middle" font-weight="bold">Status</text><text x="57" y="77" text-anchor="middle">201, 400, 404</text>
  <rect x="115" y="35" width="105" height="55" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="167" y="60" text-anchor="middle" font-weight="bold">Validate</text><text x="167" y="77" text-anchor="middle">body first</text>
  <rect x="225" y="35" width="105" height="55" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="277" y="60" text-anchor="middle" font-weight="bold">Ids</text><text x="277" y="77" text-anchor="middle">a counter</text>
  <rect x="335" y="35" width="105" height="55" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="387" y="60" text-anchor="middle" font-weight="bold">Lookups</text><text x="387" y="77" text-anchor="middle">dict by id</text>
  <rect x="445" y="35" width="105" height="55" rx="8" fill="#e5e7eb" stroke="#374151"/><text x="497" y="60" text-anchor="middle" font-weight="bold">Delete</text><text x="497" y="77" text-anchor="middle">200 or 404</text>
</svg>
```

quiz: Why can randint ids cause a bug?
- [ ] They're too slow
- [x] Two members can get the same random id, and then get and delete act on the wrong member
- [ ] JSON can't hold big numbers
why: Random numbers repeat eventually. A counter, or a database's own ids, never hands out the same one twice.

quiz: What should POST /member answer when the body has no first_name?
- [ ] 200 with the member saved anyway
- [ ] 500
- [x] 400 with a message saying first_name is required
why: 400 means the client sent something wrong, and the message tells them how to fix it. A 500 says the server broke.

## Step: Testing and explaining it
kind: read
time: 15

### Tests for the fixes

Each fix gets a test, so it stays fixed:

```python
def test_missing_member_is_404(client):
    assert client.get("/member/999").status_code == 404

def test_new_member_is_201(client):
    response = client.post("/member", json={"first_name": "Tommy", "age": 23})
    assert response.status_code == 201
    assert response.get_json()["id"]

def test_bad_body_is_400(client):
    response = client.post("/member", json={"age": 23})
    assert response.status_code == 400
    assert "first_name is required" in response.get_json()["errors"]
```

`client.post(..., json=...)` sends a JSON body, and `response.get_json()` reads the answer. Run them with `python -m pytest` in PowerShell.

### Explain it in an interview

1. **What it is:** "A Flask REST API where the data lives behind a class with add, get and delete methods, so the routes stay thin."
2. **Why the class:** "If the members moved into a database, I'd rewrite the class and the routes wouldn't change."
3. **What I'd improve:** "Return 404 for a missing member and 201 for a new one, validate the body and answer 400, use a counter for ids and a dict for lookups, and test each of those."

### Drill: from memory

Write a Flask app with an in-memory dict of books and four routes (`GET /books`, `GET /books/<int:id>`, `POST /books`, `DELETE /books/<int:id>`) that return 404, 201 and 400 correctly. Then write two tests with the test client.

```svg Each request in a test goes through Flask's test client straight to the app, with no server or network, and the test checks the status code and JSON
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 110" font-family="sans-serif" font-size="12">
  <rect width="560" height="110" fill="#ffffff"/>
  <rect x="10" y="30" width="140" height="50" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="80" y="52" text-anchor="middle" font-weight="bold">pytest test</text><text x="80" y="68" text-anchor="middle">client.post(...)</text>
  <rect x="210" y="30" width="140" height="50" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="280" y="52" text-anchor="middle" font-weight="bold">Flask app</text><text x="280" y="68" text-anchor="middle">the real routes</text>
  <rect x="410" y="30" width="140" height="50" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="480" y="52" text-anchor="middle" font-weight="bold">assert</text><text x="480" y="68" text-anchor="middle">status and JSON</text>
  <path d="M150 55 H206 M350 55 H406" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: What does Flask's test client let a test do?
- [x] Call the app's routes directly, with no server running, and read the status code and JSON
- [ ] Open a browser
- [ ] Deploy the app
why: The test client sends fake requests straight into the app, so tests are fast and need no network.

quiz: In an interview, what's the strongest way to talk about an early project?
- [ ] Hide that it's old
- [ ] Say it's perfect
- [x] Explain what it does, then name specific fixes you'd make now and why
why: Naming real, specific improvements shows you've grown and that you review code carefully.

## Finish

You walked through a Flask REST API and reviewed it like a senior developer. You learned:

- **REST** methods, paths and **status codes**
- Flask **routes**, **URL converters**, `request.get_json()` and `jsonify`
- Data behind a **class** with methods (**encapsulation**)
- **Validation** that answers 400 with every problem listed
- Ids from a **counter** and lookups from a **dict**
- Tests with **pytest** and Flask's **test client**

### Challenges

1. Make the five review fixes in your own copy of the Family API, with a test for each.
2. Add `PUT /member/<int:id>` that changes a member and answers 404 if there's none.
3. Move the members into SQLite, changing only the class, and check the routes and tests still pass.
