// Built from guides/flaskapis.md by scripts/build-guides.js. Edit the guide, not this file.
export default {
 "id": "flaskapis",
 "title": "Flask REST API (Family)",
 "goals": [
  "Build REST endpoints in Flask with routes, URL converters, request.get_json and jsonify",
  "Keep data behind a class with methods so routes stay thin",
  "Test endpoints with pytest and Flask's test client",
  "Review your own older code honestly: status codes, validation, ids and lookups",
  "Explain the project clearly in an interview"
 ],
 "prereqs": [
  "Python basics (classes, dictionaries, lists)"
 ],
 "sessions": [
  {
   "title": "The Family API: routes and a data class",
   "from": 0,
   "to": 2
  },
  {
   "title": "Reviewing and growing the Family API",
   "from": 3,
   "to": 4
  }
 ],
 "start": {},
 "steps": [
  {
   "title": "What a REST API is, and the Family API",
   "body": "A **REST API** is a set of web addresses (endpoints) that other programs call to read and change data. Each endpoint is a **method** plus a **path**:\n\n| Method | Means | Example |\n|---|---|---|\n| GET | read | `GET /members` |\n| POST | create | `POST /member` with a JSON body |\n| PUT / PATCH | change | `PUT /member/3` |\n| DELETE | remove | `DELETE /member/3` |\n\nThe answer is JSON plus a **status code**: 200 OK, 201 Created, 400 Bad Request, 404 Not Found.\n\nIn this guide you'll walk through the [**Family Static API**](https://github.com/TheoYanvno/Family-APi), an API I built in 2023: the members of the \"Jackson\" family, kept in a Python class instead of a database.\n\nIt's an early project, and the last session reviews it the way a senior developer would. Knowing what you'd fix in your own old code is one of the best things you can show in an interview.\n\n```svg A REST call: the client sends a method and a path with an optional JSON body; Flask finds the matching route function, which answers with JSON and a status code\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 130\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"130\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"40\" width=\"130\" height=\"50\" rx=\"8\" fill=\"#f3f4f6\" stroke=\"#6b7280\"/><text x=\"75\" y=\"62\" text-anchor=\"middle\">Postman, a page,</text><text x=\"75\" y=\"78\" text-anchor=\"middle\">another program</text>\n  <rect x=\"210\" y=\"40\" width=\"140\" height=\"50\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"280\" y=\"62\" text-anchor=\"middle\" font-weight=\"bold\">Flask route</text><text x=\"280\" y=\"78\" text-anchor=\"middle\">@app.route(...)</text>\n  <rect x=\"420\" y=\"40\" width=\"130\" height=\"50\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"485\" y=\"62\" text-anchor=\"middle\" font-weight=\"bold\">data</text><text x=\"485\" y=\"78\" text-anchor=\"middle\">class or database</text>\n  <text x=\"175\" y=\"30\" text-anchor=\"middle\">POST /member</text><path d=\"M140 55 H206\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <text x=\"175\" y=\"112\" text-anchor=\"middle\">JSON + 201</text><path d=\"M206 80 H140\" stroke=\"#374151\" stroke-width=\"2\"/>\n  <path d=\"M350 65 H416\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```\n\nTo run it on Windows: `pip install flask flask-cors pytest`, then `python src/app.py`. The academy template also works with `pipenv install` and `pipenv run start`.",
   "quiz": [
    {
     "q": "Which method and path would you use to remove member 7?",
     "options": [
      "GET /member/7",
      "POST /member/7",
      "DELETE /member/7"
     ],
     "answer": 2,
     "why": "The method says what to do and the path says what to do it to."
    },
    {
     "q": "What status code means \"the thing you asked for doesn't exist\"?",
     "options": [
      "200",
      "201",
      "404"
     ],
     "answer": 2,
     "why": "404 Not Found. 200 means OK, 201 means something was created."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 12
  },
  {
   "title": "The FamilyStructure class",
   "body": "`src/datastructures.py` keeps the members in a list that only the class's methods touch:\n\n```python\nfrom random import randint\n\nclass FamilyStructure:\n    def __init__(self, last_name):\n        self.last_name = last_name\n        self._members = []\n\n    def _generateId(self):\n        return randint(0, 99999999)\n\n    def add_member(self, member):\n        if \"id\" not in member:\n            member[\"id\"] = self._generateId()\n        self._members.append(member)\n\n    def delete_member(self, id):\n        self._members = list(filter(lambda member: member[\"id\"] != id, self._members))\n\n    def get_member(self, id):\n        return list(filter(lambda member: member[\"id\"] == id, self._members))\n\n    def get_all_members(self):\n        return self._members\n```\n\n- **`_members` starts with an underscore**: Python's convention for \"private, use the methods\". The routes never touch the list directly.\n- **`add_member`** gives a new member an id only if it doesn't have one.\n- **`delete_member`** builds a new list without that id. `filter(fn, items)` keeps the items where `fn` returns True.\n- **`get_member`** returns a **list** of matches: empty if there's none, one member if there is.\n\n### Why put data behind a class?\n\nThe routes only call methods. If the family moved into a database tomorrow, you'd rewrite the class and the routes wouldn't change. That's **encapsulation**, and it's the same idea as keeping all the SQL in one store module.\n\n```svg The routes only call FamilyStructure's methods; the list of members stays inside the class, so changing how it's stored never touches the routes\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 140\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"140\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"20\" width=\"150\" height=\"100\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"85\" y=\"45\" text-anchor=\"middle\" font-weight=\"bold\">app.py routes</text><text x=\"85\" y=\"68\" text-anchor=\"middle\">GET /members</text><text x=\"85\" y=\"86\" text-anchor=\"middle\">POST /member</text><text x=\"85\" y=\"104\" text-anchor=\"middle\">DELETE /member/&lt;id&gt;</text>\n  <rect x=\"220\" y=\"10\" width=\"320\" height=\"120\" rx=\"10\" fill=\"#fff7ed\" stroke=\"#f59e0b\"/><text x=\"380\" y=\"30\" text-anchor=\"middle\" font-weight=\"bold\">FamilyStructure(\"Jackson\")</text>\n  <rect x=\"235\" y=\"45\" width=\"140\" height=\"70\" rx=\"6\" fill=\"#ffffff\" stroke=\"#f59e0b\"/><text x=\"305\" y=\"65\" text-anchor=\"middle\">add_member</text><text x=\"305\" y=\"82\" text-anchor=\"middle\">get_member</text><text x=\"305\" y=\"99\" text-anchor=\"middle\">delete_member</text>\n  <rect x=\"395\" y=\"45\" width=\"130\" height=\"70\" rx=\"6\" fill=\"#e5e7eb\" stroke=\"#374151\"/><text x=\"460\" y=\"75\" text-anchor=\"middle\">_members</text><text x=\"460\" y=\"92\" text-anchor=\"middle\">(private list)</text>\n  <path d=\"M160 70 H231 M375 80 H391\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What does get_member return when no member has that id?",
     "options": [
      "None",
      "An empty list",
      "It raises an error"
     ],
     "answer": 1,
     "why": "filter keeps only matches, so with none you get list() of nothing: []. The route has to check the length."
    },
    {
     "q": "What's the benefit of the routes only calling the class's methods?",
     "options": [
      "How the members are stored can change without touching the routes",
      "It makes the API faster",
      "Flask requires a class for data"
     ],
     "answer": 0,
     "why": "Encapsulation puts one boundary around the data. Everything else depends on the methods, not the list."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "The routes: get_json, jsonify and URL converters",
   "body": "`src/app.py` creates the family, adds three members and defines the endpoints:\n\n```python\napp = Flask(__name__)\napp.url_map.strict_slashes = False\nCORS(app)\n\njackson_family = FamilyStructure(\"Jackson\")\njackson_family.add_member({\"first_name\": \"John\", \"age\": \"33\", \"lucky_number\": [7, 13, 22]})\n\n@app.route(\"/members\", methods=[\"GET\"])\ndef handle_get_all_members():\n    return jsonify(jackson_family.get_all_members()), 200\n\n@app.route(\"/member\", methods=[\"POST\"])\ndef handle_add_member():\n    data = request.get_json()\n    jackson_family.add_member(data)\n    return jsonify(data), 200\n\n@app.route(\"/member/<int:member_id>\", methods=[\"GET\"])\ndef handle_get_member(member_id):\n    member = jackson_family.get_member(member_id)\n    if len(member) > 0:\n        return jsonify(member[0]), 200\n    return jsonify({}), 200\n```\n\n- **`@app.route(path, methods=[...])`** connects a method and path to a function.\n- **`<int:member_id>`** is a **URL converter**: `/member/42` calls the function with `member_id=42` as an int, and `/member/abc` is a 404 before your code runs.\n- **`request.get_json()`** reads the JSON body as a dict.\n- **`jsonify(...)`** turns dicts and lists into a JSON response. Returning `(response, 200)` sets the status code.\n- **`strict_slashes = False`** makes `/members` and `/members/` the same.\n- **`CORS(app)`** lets a web page on another address call the API from the browser.\n\n### Testing it\n\nThe academy's tests use **pytest** and Flask's test client:\n\n```python\ndef test_first_three(client):\n    response = client.get(\"/members\")\n    members = json.loads(response.data)\n    assert len(members) == 3\n```\n\nYou can also try every endpoint in Postman, or from PowerShell:\n\n```text\nInvoke-RestMethod http://localhost:3000/members\nInvoke-RestMethod -Method Post -Uri http://localhost:3000/member -ContentType \"application/json\" -Body '{\"first_name\":\"Tommy\",\"age\":23}'\n```",
   "quiz": [
    {
     "q": "What does <int:member_id> in a route do?",
     "options": [
      "Makes member_id optional",
      "Takes that part of the path, turns it into an int and passes it to the function; non-numbers don't match",
      "Limits the id to 3 digits"
     ],
     "answer": 1,
     "why": "Converters validate and convert path parts before your function runs."
    },
    {
     "q": "What does CORS(app) allow?",
     "options": [
      "Any program to change the code",
      "A web page served from another address to call this API from the browser",
      "Requests without JSON"
     ],
     "answer": 1,
     "why": "Browsers block cross-origin requests unless the server says they're allowed. Postman and scripts aren't affected."
    }
   ],
   "session": 0,
   "kind": "read",
   "minutes": 15
  },
  {
   "title": "Reviewing my own code",
   "body": "This is a 2023 project. Reviewing it honestly is great interview material: \"here's what I built, and here's what I'd change now\". Each fix is small.\n\n### 1. Status codes\n\n`GET /member/<id>` answers `{}` with **200** when there's no such member, and adding a member answers 200 instead of **201**. Better:\n\n```python\nmember = jackson_family.get_member(member_id)\nif not member:\n    return jsonify({\"error\": f\"No member with id {member_id}\"}), 404\nreturn jsonify(member[0]), 200\n```\n\n### 2. Validate the body\n\n`request.get_json()` returns `None` when the body is missing or isn't JSON, and `add_member` happily stores a member with no name. Check first and answer **400** with every problem listed:\n\n```python\ndata = request.get_json(silent=True)\nif not isinstance(data, dict):\n    return jsonify({\"error\": \"Send a JSON object\"}), 400\nproblems = [f\"{field} is required\" for field in (\"first_name\", \"age\") if field not in data]\nif problems:\n    return jsonify({\"errors\": problems}), 400\n```\n\n### 3. Ids that can't collide\n\n`randint(0, 99999999)` can give two members the same id. A counter can't:\n\n```python\nself._next_id = 1\n\ndef _generateId(self):\n    new_id = self._next_id\n    self._next_id += 1\n    return new_id\n```\n\n### 4. A dictionary instead of a list\n\n`get_member` and `delete_member` scan the whole list every time. Keying members by id makes each lookup one step, and \"not found\" becomes a plain `None`:\n\n```python\nself._members = {}                       # id -> member\n\ndef get_member(self, id):\n    return self._members.get(id)\n\ndef delete_member(self, id):\n    return self._members.pop(id, None) is not None\n```\n\n### 5. Delete should say what happened\n\n`DELETE /member/<id>` answers `{\"done\": True}` even for a member that never existed. With `delete_member` returning True or False, the route can answer 200 or 404.\n\n```svg A review checklist for the Family API: the right status codes, validated input, ids that can't collide, lookups by key, and deletes that report what happened\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 120\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"120\" fill=\"#ffffff\"/>\n  <rect x=\"5\" y=\"35\" width=\"105\" height=\"55\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"57\" y=\"60\" text-anchor=\"middle\" font-weight=\"bold\">Status</text><text x=\"57\" y=\"77\" text-anchor=\"middle\">201, 400, 404</text>\n  <rect x=\"115\" y=\"35\" width=\"105\" height=\"55\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"167\" y=\"60\" text-anchor=\"middle\" font-weight=\"bold\">Validate</text><text x=\"167\" y=\"77\" text-anchor=\"middle\">body first</text>\n  <rect x=\"225\" y=\"35\" width=\"105\" height=\"55\" rx=\"8\" fill=\"#fee2e2\" stroke=\"#dc2626\"/><text x=\"277\" y=\"60\" text-anchor=\"middle\" font-weight=\"bold\">Ids</text><text x=\"277\" y=\"77\" text-anchor=\"middle\">a counter</text>\n  <rect x=\"335\" y=\"35\" width=\"105\" height=\"55\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"387\" y=\"60\" text-anchor=\"middle\" font-weight=\"bold\">Lookups</text><text x=\"387\" y=\"77\" text-anchor=\"middle\">dict by id</text>\n  <rect x=\"445\" y=\"35\" width=\"105\" height=\"55\" rx=\"8\" fill=\"#e5e7eb\" stroke=\"#374151\"/><text x=\"497\" y=\"60\" text-anchor=\"middle\" font-weight=\"bold\">Delete</text><text x=\"497\" y=\"77\" text-anchor=\"middle\">200 or 404</text>\n</svg>\n```",
   "quiz": [
    {
     "q": "Why can randint ids cause a bug?",
     "options": [
      "They're too slow",
      "Two members can get the same random id, and then get and delete act on the wrong member",
      "JSON can't hold big numbers"
     ],
     "answer": 1,
     "why": "Random numbers repeat eventually. A counter, or a database's own ids, never hands out the same one twice."
    },
    {
     "q": "What should POST /member answer when the body has no first_name?",
     "options": [
      "200 with the member saved anyway",
      "500",
      "400 with a message saying first_name is required"
     ],
     "answer": 2,
     "why": "400 means the client sent something wrong, and the message tells them how to fix it. A 500 says the server broke."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 20
  },
  {
   "title": "Testing and explaining it",
   "body": "### Tests for the fixes\n\nEach fix gets a test, so it stays fixed:\n\n```python\ndef test_missing_member_is_404(client):\n    assert client.get(\"/member/999\").status_code == 404\n\ndef test_new_member_is_201(client):\n    response = client.post(\"/member\", json={\"first_name\": \"Tommy\", \"age\": 23})\n    assert response.status_code == 201\n    assert response.get_json()[\"id\"]\n\ndef test_bad_body_is_400(client):\n    response = client.post(\"/member\", json={\"age\": 23})\n    assert response.status_code == 400\n    assert \"first_name is required\" in response.get_json()[\"errors\"]\n```\n\n`client.post(..., json=...)` sends a JSON body, and `response.get_json()` reads the answer. Run them with `python -m pytest` in PowerShell.\n\n### Explain it in an interview\n\n1. **What it is:** \"A Flask REST API where the data lives behind a class with add, get and delete methods, so the routes stay thin.\"\n2. **Why the class:** \"If the members moved into a database, I'd rewrite the class and the routes wouldn't change.\"\n3. **What I'd improve:** \"Return 404 for a missing member and 201 for a new one, validate the body and answer 400, use a counter for ids and a dict for lookups, and test each of those.\"\n\n### Drill: from memory\n\nWrite a Flask app with an in-memory dict of books and four routes (`GET /books`, `GET /books/<int:id>`, `POST /books`, `DELETE /books/<int:id>`) that return 404, 201 and 400 correctly. Then write two tests with the test client.\n\n```svg Each request in a test goes through Flask's test client straight to the app, with no server or network, and the test checks the status code and JSON\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 560 110\" font-family=\"sans-serif\" font-size=\"12\">\n  <rect width=\"560\" height=\"110\" fill=\"#ffffff\"/>\n  <rect x=\"10\" y=\"30\" width=\"140\" height=\"50\" rx=\"8\" fill=\"#fef3c7\" stroke=\"#f59e0b\"/><text x=\"80\" y=\"52\" text-anchor=\"middle\" font-weight=\"bold\">pytest test</text><text x=\"80\" y=\"68\" text-anchor=\"middle\">client.post(...)</text>\n  <rect x=\"210\" y=\"30\" width=\"140\" height=\"50\" rx=\"8\" fill=\"#dbeafe\" stroke=\"#2563eb\"/><text x=\"280\" y=\"52\" text-anchor=\"middle\" font-weight=\"bold\">Flask app</text><text x=\"280\" y=\"68\" text-anchor=\"middle\">the real routes</text>\n  <rect x=\"410\" y=\"30\" width=\"140\" height=\"50\" rx=\"8\" fill=\"#dcfce7\" stroke=\"#16a34a\"/><text x=\"480\" y=\"52\" text-anchor=\"middle\" font-weight=\"bold\">assert</text><text x=\"480\" y=\"68\" text-anchor=\"middle\">status and JSON</text>\n  <path d=\"M150 55 H206 M350 55 H406\" stroke=\"#374151\" stroke-width=\"2\"/>\n</svg>\n```",
   "quiz": [
    {
     "q": "What does Flask's test client let a test do?",
     "options": [
      "Call the app's routes directly, with no server running, and read the status code and JSON",
      "Open a browser",
      "Deploy the app"
     ],
     "answer": 0,
     "why": "The test client sends fake requests straight into the app, so tests are fast and need no network."
    },
    {
     "q": "In an interview, what's the strongest way to talk about an early project?",
     "options": [
      "Hide that it's old",
      "Say it's perfect",
      "Explain what it does, then name specific fixes you'd make now and why"
     ],
     "answer": 2,
     "why": "Naming real, specific improvements shows you've grown and that you review code carefully."
    }
   ],
   "session": 1,
   "kind": "read",
   "minutes": 15
  }
 ],
 "finish": "You walked through a Flask REST API and reviewed it like a senior developer. You learned:\n\n- **REST** methods, paths and **status codes**\n- Flask **routes**, **URL converters**, `request.get_json()` and `jsonify`\n- Data behind a **class** with methods (**encapsulation**)\n- **Validation** that answers 400 with every problem listed\n- Ids from a **counter** and lookups from a **dict**\n- Tests with **pytest** and Flask's **test client**\n\n### Challenges\n\n1. Make the five review fixes in your own copy of the Family API, with a test for each.\n2. Add `PUT /member/<int:id>` that changes a member and answers 404 if there's none.\n3. Move the members into SQLite, changing only the class, and check the routes and tests still pass."
};
