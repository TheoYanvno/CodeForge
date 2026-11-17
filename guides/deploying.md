---
id: deploying
title: Deploying a Flask API to AWS (from Windows)
goals: Explain what deploying means and what Regions, EC2, Elastic Beanstalk and IAM roles are; Get a Flask app ready for a Linux server with gunicorn, a Procfile and environment variables; Package the app correctly on Windows so Linux can read the zip; Keep an AWS account safe and free with MFA, a zero-spend budget and the Free plan; Create an Elastic Beanstalk environment with least-privilege roles, read its logs and ship a new version; Explain the deployment honestly in an interview and say what production would add
prereqs: The Dataset Catalog API guide (or any small Flask app); A Windows PC with Python 3 and PowerShell (works on Mac and Linux too: the differences are noted); An AWS account on the Free plan, which you create yourself
---

## Session: Ready to deploy

## Step: What deploying means
kind: read
time: 12

So far your Flask API runs on `http://127.0.0.1:5000`: your own computer, and only while the terminal is open. **Deploying** means running it on a server in a data center, all the time, at an address anyone can reach. In this guide you'll deploy the Dataset Catalog API to **Amazon Web Services (AWS)**, the biggest cloud provider, using a service that does most of the setup for you.

### The AWS pieces you'll use

- **Region:** a group of AWS data centers in one area, like `us-east-2` (Ohio). Your app runs in that Region.
- **EC2:** virtual servers. An **instance** is one server; `t3.micro` is a small, cheap size.
- **Elastic Beanstalk:** you upload your code, and it creates the EC2 instance, installs Python, runs your app behind a web server (nginx), and watches its health. You still get a real server you can inspect.
- **IAM (Identity and Access Management):** who and what is allowed to do what. A **role** is a set of permissions that a service (not a person) uses.

```svg Your code goes to Elastic Beanstalk, which runs it on an EC2 instance inside a Region; people reach it through nginx on the instance, and IAM roles decide what Elastic Beanstalk and the instance may do
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 580 190" font-family="sans-serif" font-size="12">
  <rect width="580" height="190" fill="#ffffff"/>
  <rect x="10" y="70" width="110" height="50" rx="8" fill="#f3f4f6" stroke="#6b7280"/><text x="65" y="92" text-anchor="middle">your app.zip</text><text x="65" y="108" text-anchor="middle">(from Windows)</text>
  <rect x="150" y="10" width="420" height="170" rx="10" fill="#fff7ed" stroke="#f59e0b" stroke-dasharray="6 4"/><text x="560" y="28" text-anchor="end" fill="#b45309">Region us-east-2</text>
  <rect x="170" y="70" width="120" height="50" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="230" y="92" text-anchor="middle" font-weight="bold">Elastic</text><text x="230" y="108" text-anchor="middle" font-weight="bold">Beanstalk</text>
  <rect x="320" y="45" width="230" height="100" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="435" y="65" text-anchor="middle" font-weight="bold">EC2 instance (Linux)</text>
  <rect x="335" y="80" width="90" height="44" rx="6" fill="#ffffff" stroke="#16a34a"/><text x="380" y="106" text-anchor="middle">nginx</text>
  <rect x="445" y="80" width="90" height="44" rx="6" fill="#ffffff" stroke="#16a34a"/><text x="490" y="99" text-anchor="middle">gunicorn</text><text x="490" y="115" text-anchor="middle">+ your Flask</text>
  <rect x="170" y="140" width="120" height="32" rx="6" fill="#fce7f3" stroke="#db2777"/><text x="230" y="161" text-anchor="middle">IAM roles</text>
  <path d="M120 95 H166 M290 95 H316 M425 102 H441" stroke="#374151" stroke-width="2"/>
</svg>
```

### What it costs

New AWS accounts start on the **Free plan**: credits to spend on most services for up to 6 months, and when the credits or the months run out, AWS pauses the account instead of charging you. One small instance with no load balancer uses only a little of the credits each month. Check the current terms on the AWS Free Tier page when you sign up, because they change.

quiz: What does Elastic Beanstalk do for you?
- [ ] Writes your Flask code
- [x] Creates and runs the server for your uploaded code: the EC2 instance, Python, the web server and health checks
- [ ] Only stores your zip file
why: It's a "platform as a service": you bring the code, it handles the servers, and you can still look at them.

quiz: What is an IAM role?
- [x] A set of permissions a service uses to act in your account
- [ ] Your AWS password
- [ ] A type of server
why: Roles give services exactly the permissions they need, without sharing anyone's password or keys.

## Step: Get the app ready for a server
kind: read
time: 15

On your computer, `python run.py` starts Flask's **development server**. It's fine for one person, but it isn't built for real traffic. On the server, a production server called **gunicorn** runs the app instead. Elastic Beanstalk looks for a file named `application.py` with a variable named `application`. Add it next to `run.py`:

```python
"""Entry point for AWS Elastic Beanstalk, which serves the WSGI callable named `application`."""
import json
import os
from pathlib import Path

from catalog.app import create_app
from load import load

os.environ.setdefault("CATALOG_DB", "/tmp/catalog.db")
application = create_app()

conn = application.config["CONN"]
if not conn.execute("SELECT 1 FROM datasets LIMIT 1").fetchone():
    sample = Path(__file__).with_name("data") / "sample_datasets.json"
    load(conn, json.loads(sample.read_text(encoding="utf-8")))
```

- `create_app()` is the application factory from the catalog guide, so nothing in the API changes.
- `os.environ.setdefault(...)` uses `/tmp/catalog.db` unless an environment variable says otherwise. Settings come from the environment, so the same code runs on your PC and on AWS.
- On first start the database is empty, so the sample datasets are loaded. The loader is idempotent, so a restart never duplicates anything.
- `encoding="utf-8"` matters: without it, Windows and Linux can read the same file differently.

Then tell AWS what to install and how to start:

```text
requirements.txt
flask>=3.0
gunicorn>=22.0

Procfile
web: gunicorn --bind :8000 --workers 1 application:application
```

`application:application` means "the `application` variable in `application.py`". nginx on the instance forwards web requests to port 8000. One worker is enough for a tiny instance, and keeps the SQLite file from being written by two processes at once.

### Windows: test with Flask's server, not gunicorn

**gunicorn doesn't run on Windows**: it needs features only Linux and macOS have. That's fine, because only the server runs it. On Windows, test locally the usual way, in a virtual environment:

```text
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

(If PowerShell refuses to run `Activate.ps1`, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once, or use `.venv\Scripts\activate.bat` in Command Prompt. On a Mac it's `source .venv/bin/activate`.) `pip install` puts gunicorn in the venv without complaint, and then nothing on your PC uses it. Also check that `application.py` imports cleanly: `python -c "from application import application; print('ok')"`.

```svg The same code in two places: on your Windows PC, python run.py starts Flask's development server; on the Linux server, the Procfile starts gunicorn, which serves application.py
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 160" font-family="sans-serif" font-size="12">
  <rect width="560" height="160" fill="#ffffff"/>
  <rect x="10" y="20" width="250" height="120" rx="10" fill="#dbeafe" stroke="#2563eb"/><text x="135" y="42" text-anchor="middle" font-weight="bold">Your Windows PC</text>
  <text x="30" y="70" font-family="monospace">python run.py</text><text x="30" y="92">Flask development server</text><text x="30" y="114">127.0.0.1:5000, only you</text>
  <rect x="300" y="20" width="250" height="120" rx="10" fill="#dcfce7" stroke="#16a34a"/><text x="425" y="42" text-anchor="middle" font-weight="bold">AWS Linux server</text>
  <text x="320" y="70" font-family="monospace">Procfile → gunicorn</text><text x="320" y="92">serves application.py</text><text x="320" y="114">public address, all day</text>
</svg>
```

quiz: Why does the Procfile start gunicorn instead of `python run.py`?
- [ ] Flask can't run on Linux
- [x] Flask's built-in server is for development; gunicorn is a production server built for real traffic
- [ ] gunicorn is faster to type
why: Development servers favor convenience and debugging; production servers are built for many requests and stability.

quiz: How do you run the app locally on Windows?
- [ ] gunicorn application:application
- [x] python run.py, inside the virtual environment
- [ ] You can't: it only runs on AWS
why: gunicorn needs Linux or macOS. Flask's own server works everywhere and is what you use while developing.

## Step: Package it on Windows
kind: read
time: 12

Elastic Beanstalk takes your code as a **zip file**, called a **source bundle**. Two rules:

1. `application.py`, `Procfile` and `requirements.txt` must be at the **top** of the zip, not inside a folder.
2. The paths inside must use **forward slashes** (`catalog/app.py`), because the server is Linux.

That second rule is the Windows trap. PowerShell's `Compress-Archive` in Windows PowerShell 5.1 can write paths with backslashes (`catalog\app.py`), and Linux then sees one strangely named file instead of a folder, so the app fails to start. Use **tar**, which ships with Windows 10 and 11 and writes zips with forward slashes. In PowerShell, from the project folder:

```text
tar -a -c -f app.zip application.py Procfile requirements.txt load.py catalog data
tar -tf app.zip
```

- `-a` picks the format from the file name (`.zip`), `-c` creates, `-f app.zip` names the file.
- List only what the server needs: no `tests`, no `.venv`, no `__pycache__`, no local `catalog.db`.
- `tar -tf app.zip` lists what's inside. Check that you see `catalog/app.py` with a forward slash, and `application.py` at the top with no folder in front of it.

On a Mac or Linux the same thing is `zip -r app.zip application.py Procfile requirements.txt load.py catalog data -x "*__pycache__*"`.

```svg The source bundle: application.py, Procfile and requirements.txt sit at the top of the zip, with the catalog and data folders beside them, all written with forward slashes
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 190" font-family="monospace" font-size="13">
  <rect width="520" height="190" fill="#ffffff"/>
  <rect x="10" y="10" width="300" height="170" rx="8" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="25" y="35" font-weight="bold">app.zip</text>
  <text x="40" y="58">application.py</text><text x="40" y="78">Procfile</text><text x="40" y="98">requirements.txt</text><text x="40" y="118">load.py</text>
  <text x="40" y="138">catalog/app.py  ...</text><text x="40" y="158">data/sample_datasets.json</text>
  <text x="330" y="70" font-family="sans-serif" fill="#166534">at the top: no folder</text><text x="330" y="88" font-family="sans-serif" fill="#166534">around them</text>
  <text x="330" y="145" font-family="sans-serif" fill="#166534">forward slashes, so Linux</text><text x="330" y="163" font-family="sans-serif" fill="#166534">sees real folders</text>
</svg>
```

quiz: Why use `tar -a -c -f app.zip ...` on Windows instead of Compress-Archive?
- [ ] tar makes smaller files
- [x] Older Compress-Archive can write backslashes into the zip's paths, which a Linux server misreads
- [ ] Elastic Beanstalk only accepts tar files
why: Zip paths should use forward slashes. Windows' tar writes them correctly, so the server sees catalog/app.py as a file in a folder.

quiz: Which of these should NOT go in the source bundle?
- [ ] Procfile
- [ ] requirements.txt
- [x] The .venv folder
why: The server builds its own environment from requirements.txt. A Windows venv is useless on Linux and makes the upload huge.

## Session: On AWS

## Step: Keep the account safe and free
kind: read
time: 12

Do these before creating anything. Create the account yourself at aws.amazon.com and choose the **Free plan**.

1. **MFA on the root user.** The root user can do everything, including closing the account. Click your name at the top right, choose **Security credentials**, and add an authenticator app. Never create access keys for the root user.
2. **A zero-spend budget.** Open **Billing and Cost Management → Budgets → Create budget** and pick the **zero spend** template. AWS emails you the moment anything costs money.
3. **One Region.** A Free plan account is assigned one Region (mine was **US East (Ohio) us-east-2**). If the console says a Region is unavailable, click **Return to** your Region. Don't click **Activate advanced features**: that upgrades you to the paid plan. Keep everything in that one Region, so nothing gets forgotten somewhere else.
4. **Watch the credits.** **Billing → Credits** shows what's left and when it expires.

```svg Safe and free: lock the root user with MFA, set a zero-spend budget, stay in one Region, and check the credits now and then
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120" font-family="sans-serif" font-size="12">
  <rect width="560" height="120" fill="#ffffff"/>
  <rect x="10" y="30" width="125" height="60" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="72" y="56" text-anchor="middle" font-weight="bold">MFA</text><text x="72" y="74" text-anchor="middle">on root</text>
  <rect x="150" y="30" width="125" height="60" rx="8" fill="#fef3c7" stroke="#f59e0b"/><text x="212" y="56" text-anchor="middle" font-weight="bold">Zero-spend</text><text x="212" y="74" text-anchor="middle">budget alert</text>
  <rect x="290" y="30" width="125" height="60" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="352" y="56" text-anchor="middle" font-weight="bold">One Region</text><text x="352" y="74" text-anchor="middle">us-east-2</text>
  <rect x="430" y="30" width="120" height="60" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="490" y="56" text-anchor="middle" font-weight="bold">Check</text><text x="490" y="74" text-anchor="middle">credits</text>
</svg>
```

quiz: Why turn on MFA for the root user first?
- [ ] AWS won't let you deploy without it
- [x] The root user can do anything in the account, so a stolen password alone shouldn't be enough to get in
- [ ] It makes the console faster
why: Multi-factor authentication means a password leak isn't a full account takeover. It's the first thing any security review checks.

## Step: Create the environment
kind: read
time: 20

Open **Elastic Beanstalk** in the console and click **Create application** (or **Create environment**). Everything is on one long page now; the console's wording changes now and then, but the choices stay the same:

1. **Application name:** type `dataset-catalog-api` and pick **Create new application** from the list. **Environment name:** `catalog-api`.
2. **Domain name prefix:** something unique like `yourname-catalog-api`. It shows a green "is available" when it's free. This becomes your web address.
3. **Platform:** Python, with the recommended branch and version.
4. **Application code:** **Local file**, then **Choose file** and pick `app.zip`.
5. **Environment tier:** Web server. **Environment type:** **Single instance**. A single instance has no load balancer, which keeps costs low.
6. **Service access (the roles):** the console now creates both roles for you ("Your environment will automatically be given permission"). Click **Customize** only if you want to pick existing roles:
   - **Service role:** lets Elastic Beanstalk create and watch your resources.
   - **EC2 instance profile:** the role your server uses, with the **AWSElasticBeanstalkWebTier** permissions.
7. **Infrastructure → Instance types:** it lists `t3.micro` and `t3.small`. Click **Remove** next to `t3.small`, so only the free-tier `t3.micro` is left.
8. **Monitoring and updates:** choose **Basic** health reporting. Then turn off **Managed platform updates**, because they need Enhanced health reporting: leave both on together, or the Create button gives a "Configuration validation exception".
9. Leave networking and the rest on their defaults, then click **Create**.

Creating the environment takes 5 to 10 minutes. The events list shows each piece being made: a security group, the EC2 instance, then deploying your code.

```svg Two roles with different jobs: the service role lets Elastic Beanstalk manage your environment; the instance profile gives the EC2 server only the web-tier permissions it needs, which is least privilege
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 160" font-family="sans-serif" font-size="12">
  <rect width="560" height="160" fill="#ffffff"/>
  <rect x="10" y="20" width="160" height="50" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="90" y="50" text-anchor="middle" font-weight="bold">Elastic Beanstalk</text>
  <rect x="10" y="95" width="160" height="50" rx="8" fill="#dcfce7" stroke="#16a34a"/><text x="90" y="125" text-anchor="middle" font-weight="bold">EC2 instance</text>
  <rect x="210" y="20" width="160" height="50" rx="8" fill="#fce7f3" stroke="#db2777"/><text x="290" y="42" text-anchor="middle">service role</text><text x="290" y="58" text-anchor="middle">manage the environment</text>
  <rect x="210" y="95" width="160" height="50" rx="8" fill="#fce7f3" stroke="#db2777"/><text x="290" y="117" text-anchor="middle">instance profile</text><text x="290" y="133" text-anchor="middle">WebTier only</text>
  <text x="400" y="70" fill="#374151">least privilege:</text><text x="400" y="88" fill="#374151">each gets only what</text><text x="400" y="106" fill="#374151">its job needs</text>
  <path d="M170 45 H206 M170 120 H206" stroke="#374151" stroke-width="2"/>
</svg>
```

quiz: Why choose "Single instance" instead of a load-balanced environment for this project?
- [x] One server is enough for a demo, and without a load balancer it stays within the free credits
- [ ] Load balancers don't work with Python
- [ ] Single instance is faster for millions of users
why: Load balancers spread traffic over several servers and cost money by the hour. A learning project doesn't need one.

quiz: What does "least privilege" mean for the EC2 instance profile?
- [ ] The server gets admin access so nothing fails
- [x] The server gets only the permissions its job needs, so a compromised server can't do much
- [ ] The server has no permissions at all
why: Limiting permissions limits the damage of any mistake or break-in. It's a core security principle in every cloud.

## Step: Test it, read the logs, ship a new version
kind: read
time: 15

When **Health** turns green, click the **Domain** link and add `/api/health`. The address starts with `http://`, not `https://`: a single-instance environment has no HTTPS certificate, so the browser may say **Not secure**. That's expected for a demo. You should see:

```json
{"status": "ok"}
```

Then try `/api/datasets`, `/api/datasets?keyword=health` and `/api/datasets/park-locations`. Test from PowerShell too:

```text
curl.exe http://YOUR-PREFIX.us-east-2.elasticbeanstalk.com/api/health
Invoke-RestMethod http://YOUR-PREFIX.us-east-2.elasticbeanstalk.com/api/datasets
```

(In Windows PowerShell, plain `curl` is a nickname for `Invoke-WebRequest`; `curl.exe` runs the real curl that comes with Windows.)

### When it's red: read the logs

Open **Logs → Request logs → Last 100 lines**. Look near the bottom for a Python traceback. The usual causes are `ModuleNotFoundError` (a file missing from the zip, or backslashes in its paths), a typo in the Procfile, or a package missing from `requirements.txt`. Fix it, re-zip, and upload again.

### Shipping a new version

Change the code, test it with `python run.py`, make a new zip, then in the environment click **Upload and deploy** with the label `v2`. Elastic Beanstalk keeps every version, so you can roll back to `v1` from **Application versions** if something breaks.

### Turning it off

A single instance gets a public IPv4 address, which AWS bills at about $0.005 an hour (about $3.60 a month). On the Free plan that comes out of your credits, not your card, but it's a reason not to leave it running forever.

When you no longer need it: **Actions → Terminate environment**. That deletes the instance, so nothing keeps using credits. The application and its versions stay, so you can make a new environment later.

Note that this app stores its data in SQLite in `/tmp` on the instance, so records you add are lost when the instance is replaced. That's fine for a demo, and it's exactly the kind of limitation to mention in an interview.

quiz: The environment is red and the logs show `ModuleNotFoundError: No module named 'catalog'`. What's the likely cause?
- [ ] AWS doesn't support Flask
- [x] The catalog folder is missing from the zip, or its paths were written with backslashes
- [ ] The Region is wrong
why: The server can only import what's in the bundle, laid out as real folders. Check with `tar -tf app.zip`.

quiz: Why use `curl.exe` instead of `curl` in Windows PowerShell?
- [ ] curl.exe is faster
- [x] In Windows PowerShell, `curl` is a nickname for Invoke-WebRequest; `curl.exe` runs real curl
- [ ] curl doesn't exist on Windows
why: Windows 10 and 11 include real curl, but Windows PowerShell's alias hides it unless you add `.exe`.

## Step: Explain it in an interview
kind: read
time: 12

Say what you did, how, and what you'd add for production. Practice this until it takes about a minute:

> "I deployed my Flask Dataset Catalog API to AWS Elastic Beanstalk on a single t3.micro EC2 instance in us-east-2. gunicorn serves it through a Procfile, and settings like the database path come from environment variables. I set up the service role and an instance profile with only the web-tier permissions, turned on MFA for the root user and set a zero-spend budget. I package it from Windows with tar, so the paths are right for Linux, and I debug from the Elastic Beanstalk logs."

Then be honest about what it isn't:

| Now (learning deployment) | For production |
|---|---|
| SQLite in /tmp, lost when the instance is replaced | PostgreSQL on **Amazon RDS**, with backups |
| http on the Elastic Beanstalk address | **HTTPS** with a certificate and a custom domain |
| Upload a zip by hand | **CI/CD**: GitHub Actions runs the tests, then deploys |
| Request logs in the console | **CloudWatch** logs, metrics and alarms |
| One instance | A load balancer and auto scaling for more traffic |

### Words you should be able to define

Region, EC2 instance, Elastic Beanstalk, IAM role, least privilege, environment variable, source bundle, health check, rollback, load balancer.

### Drill

Close this guide and draw the first diagram from memory: zip → Elastic Beanstalk → EC2 (nginx → gunicorn → Flask), inside a Region, with the two roles. Then explain each box out loud in one sentence.

quiz: An interviewer asks what you'd change to make this production-ready. Which answer is best?
- [ ] Nothing, it's already in the cloud
- [x] A managed database like RDS instead of SQLite, HTTPS, CI/CD from GitHub Actions and CloudWatch monitoring
- [ ] Use a bigger instance
why: Naming the real gaps shows you understand the difference between a demo and production. Honesty about limits is a strength in an interview.

## Finish

You deployed a real API to AWS from a Windows PC. You learned:

- What **Regions**, **EC2**, **Elastic Beanstalk** and **IAM roles** are
- Getting a Flask app ready for a server: `application.py`, **gunicorn**, a **Procfile**, environment variables
- Why gunicorn doesn't run on Windows, and testing locally with Flask's server instead
- Packaging a **source bundle** on Windows with `tar` so the paths work on Linux
- Keeping an account safe and free: **MFA**, a **zero-spend budget**, the **Free plan**
- Creating an environment with **least-privilege** roles, reading logs, deploying a new version and rolling back
- Explaining the deployment honestly, with what production would add

### Challenges

1. Add a GitHub Actions workflow that runs the tests on every push (the GitHub guide shows the YAML).
2. Set `CATALOG_DB` in **Configuration → Updates, monitoring and logging → Environment properties** and check the app uses it.
3. Read about the EB CLI (`pip install awsebcli`, then `eb init` and `eb deploy`) and deploy `v3` from the terminal instead of the console.
