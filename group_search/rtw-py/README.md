## how to use

1. create a python env (myself using python 3.11 with conda)
2. within the created python env, installs:

```
  $ pip install -r requirements.txt
```

3. download chromedriver (I'm using stable version: 123)
4. change the facebook login information from .env file
5. ready to go

```
  $ python3 get_groups.py -s MA -r y
```

## Forgot to mention the groups skip logic from the recording

The skip logic is located at function: GroupItem.is_skip() (in entities.py file)
The logic will skip not Private, buy or sell, memebers under 1000 members etc
The current skip logic is still simple and can be enhanced later
