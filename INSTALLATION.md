# Installation for Ubuntu 20.04 LTS (Focal Fossa)

#### Step 1

We need login to the server as **root** once we have received the root credentials from the hosting company.

We need to ensure sure the system is up to date after signing in as root.

```
sudo apt update
sudo apt upgrade
```

With `adduser backend` create a non-root user named `backend`.

##### Important Step

To install the essential packages for WhatsApp notifications, run the following command:

```bash
sudo apt install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
```

#### Login to the non-root user

```bash
ssh backend@IP
```

#### Step 2 - NVM

NVM (Node Version Manager) must now be installed:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

For the `nvm` command to be available, restart the shell with `exec $SHELL`.

#### Step 3 - Node

Install the most recent stable version of node with:

```bash
nvm install --lts
```

`node -v` or `npm -v` can be used to validate the installation.

#### Step 4 - SSH

Run the following command to generate a new SSH key for Github.

```bash
ssh-keygen -t ed25519
```

Start the ssh-agent in the background now by typing:

```bash
eval "$(ssh-agent -s)"
```

Add your SSH private key to the ssh-agent configuration file.

```bash
ssh-add ~/.ssh/id_ed25519
```

Copy the public key to the repository as a read-only key in the deploy keys section.

Make sure you're connected to the Github repository:

```bash
ssh -T git@github.com
```

Now we must update the `authorized_keys` file with our own ssh key:

```bash
cat /home/backend/.ssh/id_ed25519.pub >> /home/backend/.ssh/authorized_keys
```

#### Step 5 - Clone

It's now time to download our backend code:

```bash
git clone REPO && mv REPO_NAME backend
```

**[IMPORTANT]** Check out of the `main` branch and into the `production` branch.

```bash
cd REPO_NAME && git checkout production
```

Install production dependencies:

```bash
npm install --only=production
```

#### Step 6 - Supervisor

Supervisor should be installed as the **root** user.

```bash
sudo apt install supervisor
```

Supervisor configurations should be linked to supervisor:

```bash
sudo ln -s /home/backend/backend/supervisor/* /etc/supervisor/conf.d/
```

Allow non-root users to use `supervisorctl`:

Edit `/etc/supervisor/supervisord.conf` under `[unix_http_server]` set chown to the non-root username (`chown=username`).

Supervisor should then be restarted: `service supervisor restart`

#### Step 7 - Github Secrets:

We must now add 3 Github secrets:

`HOST` -> IP address of the server

`KEY` -> The Private SSH KEY that we previously created.

`USERNAME` -> The username for non-root user

#### Step 8 - Configuration of the project

To acquire a basic setup, copy the `.env.exmaple` file (inside the project directory).

```bash
cp .env.exmaple .env
```

Then fill in the fields that are empty.

**Make sure `NODE_ENV` is set to `production`.**

#### Step 9 - Redis

Now you must install Redis as *root*, which you may do by following the procedures outlined in the following link:

https://gist.github.com/jewishmoses/75854576a448cd36c39f1a3a5d9d997d

#### Step 10 - MongoDB

Install MongoDB as the **root** user.

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

You may check if it's functioning by using:

```bash
sudo systemctl status mongod
```

Create an admin user using `mongosh`:

First login using:

```bash
mongosh
```

Use the admin database:

```bash
use admin
```

Create the admin user (enter the desired password when promoted):

```bash
db.createUser(
  {
    user: "backend",
    pwd: passwordPrompt(),
    roles: [
      { role: "userAdminAnyDatabase", db: "admin" },
      { role: "readWriteAnyDatabase", db: "admin" }
    ]
  }
)
```

And finally exit mongosh

```bash
db.adminCommand( { shutdown: 1 } )
exit
```

Then add or append the following to `/etc/mongod.conf`:

```
security:
    authorization: enabled
```

Start MongoDB: `sudo systemctl start mongod`
Enable on restart: `sudo systemctl enable mongod`

You may use the following commands to test the new MongoDB user:

```
mongosh --port 27017  --authenticationDatabase "admin" -u "Username" -p
```

Make sure to update the '.env' file after installing MongoDB.

#### Step 11 - Nginx

We must now install `Nginx` using `sudo apt install nginx`.

To point to the express server, edit the configuration file:

```bash
sudo vim /etc/nginx/sites-available/default
```

Configuration:

```nginx
server {
        listen 80;
        listen [::]:80;

        server_name DOMAIN;

        root /home/backend/doh1-backend;

        location / {
            proxy_pass http://localhost:PORT;
        }
}
```

Check to see if the configuration file is correct: `sudo nginx -t`
Nginx must be reloaded in order for the modifications to take effect: `sudo nginx -s reload`

#### Step 12 - WhatsApp

To login, launch the WhatsApp script, run `node whatsapp.js` within the root project directory, scan the QR code, then quit the script with `CTRL` + `C`.
