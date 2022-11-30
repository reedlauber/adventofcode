# Advent of Code

## Instructions

### 1. Drop into the current year directory

```
cd 2022
```

### 2. Install NVM, if not already installed

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash
```

### 3. If bash profile doesn't already pick up `.nvmrc` files, set Node version

```
nvm use
```

### 4. To run a particular day, step

```
/*
Options: 
-d - Day number (1 - 25)
-s - Step number (1 or 2)
-r - Use real data (not example data)
*/

node index.js -d 1 -s 1 # use example data
node index.js -d 1 -s 1 # use real data
```

### 5. Generate next day when ready

```
node index.js next
```
