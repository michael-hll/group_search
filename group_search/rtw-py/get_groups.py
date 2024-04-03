from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from entities import GroupItem
from utilities import read_csv_to_array, write_array_to_csv
from dotenv import load_dotenv
import time
import traceback
import argparse
import os


def initOptions():
  options = webdriver.ChromeOptions()
  options.add_argument("--start-maximized")
  options.add_experimental_option("useAutomationExtension", False)
  options.add_experimental_option("excludeSwitches", ["enable-automation"])
  options.add_experimental_option(
      "prefs",
      {
          "credentials_enable_service": False,
          "profile.password_manager_enabled": False,
          "profile.default_content_setting_values.notifications": 2
          # with 2 should disable notifications
      },
  )
  return options


driver = webdriver.Chrome(initOptions())
load_dotenv(override=True)  # take environment variables from .env.
facebook_email = os.getenv('FACEBOOK_EMAIL')
facebook_pwd = os.getenv('FACEBOOK_PWD')
print(f'[{facebook_email}], [{facebook_pwd}]')


def login():
  driver.get("http://www.facebook.com")
  email = WebDriverWait(driver, 10).until(
      EC.presence_of_element_located((By.ID, "email"))
  )
  password = WebDriverWait(driver, 10).until(
      EC.presence_of_element_located((By.ID, "pass"))
  )
  login = WebDriverWait(driver, 10).until(
      EC.presence_of_element_located((By.NAME, "login"))
  )
  email.send_keys(facebook_email)
  password.send_keys(facebook_pwd)
  login.click()


def getGroupListByLocation(location: str):  # city, state
  results = {}
  # click logo: x6s0dn4 x9f619 x78zum5 x1iyjqo2 x1s65kcs x1d52u69 xixxii4 x17qophe x13vifvy xzkaem6
  logoDiv = WebDriverWait(driver, 10).until(
      EC.presence_of_element_located(
          (By.CLASS_NAME, 'x6s0dn4.x9f619.x78zum5.x1iyjqo2.x1s65kcs.x1d52u69.xixxii4.x17qophe.x13vifvy.xzkaem6'))
  )
  logoDiv.click()
  time.sleep(3)

  # the first groups link click
  groupsLinks = WebDriverWait(driver, 10).until(
      EC.presence_of_element_located((By.LINK_TEXT, 'Groups'))
  )
  groupsLinks.click()

  searchGroupTextBox = WebDriverWait(driver, 10, 1).until(
      EC.visibility_of_element_located(
          (By.XPATH, "//input[@placeholder='Search groups']")))

  searchGroupTextBox.click()
  time.sleep(3)
  searchGroupTextBox.send_keys('groups in ' + location)
  searchGroupTextBox.send_keys(Keys.ENTER)
  time.sleep(2)

  #  the second Groups link click
  groupsLinks = WebDriverWait(driver, 10, 1).until(
      EC.visibility_of_element_located((By.LINK_TEXT, 'Groups'))
  )

  groupsLinks.click()

  # get city textbox
  cityTextBox = WebDriverWait(driver, 10, 1).until(
      EC.visibility_of_element_located(
          (By.XPATH, "//input[@placeholder='City']")))
  cityTextBox.send_keys(location)
  cityTextBox.click()
  time.sleep(2)
  listContainer = driver.find_elements(
      By.CLASS_NAME, "xu96u03.xm80bdy.x10l6tqk.x13vifvy")
  time.sleep(0.1)

  cities = listContainer[0].find_elements(By.TAG_NAME, 'li')
  time.sleep(1)
  if cities and len(cities) > 0:
    cities[0].click()
  else:
    return {}

  # group list container: x193iq5w x1xwk8fm
  groupListContainer = driver.find_element(By.CLASS_NAME, 'x193iq5w.x1xwk8fm')
  if not groupListContainer:
    return {}
  groupItems = groupListContainer.find_elements(By.TAG_NAME, 'div')
  if not groupItems or len(groupItems) == 0:
    return {}
  time.sleep(1)

  # no results case
  try:
    # We didn't find any results
    #
    noResultsLable = driver.find_element(
        By.XPATH, "//*[contains(text(), 'find any results')]")
    if noResultsLable:
      return {}
  except Exception:
    pass

  # Ending logic
  found = False
  body = driver.find_element(By.TAG_NAME, 'body')
  while not found:
    # end of results
    try:
      endOfResults = driver.find_element(
          By.CLASS_NAME, 'x193iq5w.xeuugli.x13faqbe.x1vvkbs.xlh3980.xvmahel.x1n0sxbx.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x4zkp8e.x3x7a5m.x6prxxf.xvq8zen.xo1l8bm.xi81zsa.x2b8uid')
      if (endOfResults):
        found = True
    except Exception:
      pass

    # no results case
    try:
      # We didn't find any results
      #
      noResultsLable = driver.find_element(
          By.XPATH, "//*[contains(text(), 'find any results')]")
      if noResultsLable:
        return {}
    except Exception:
      pass

    if not found:
      try:
        body.send_keys(Keys.PAGE_DOWN)
        # Wait to load page
        time.sleep(1)
      except Exception:
        pass

  groupItems = groupListContainer.find_elements(By.TAG_NAME, 'div')
  # go through each group item
  for item in groupItems:
    # find properties by class: xu06os2 x1ok221b
    properties = item.find_elements(By.CLASS_NAME, 'xu06os2.x1ok221b')
    if len(properties) == 3:

      titleAnchor = properties[0].find_element(By.TAG_NAME, 'a')
      href = titleAnchor.get_attribute('href')
      title = titleAnchor.text

      publicAndMembers = item.find_element(
          By.CLASS_NAME, 'x1lliihq.x6ikm8r.x10wlt62.x1n2onr6')
      publicAndMembersArr = publicAndMembers.text.split('·')

      description = properties[2].find_elements(
          By.TAG_NAME, 'span')[1].text.replace('"', "'")
      post = 'NA'
      if 'post' in publicAndMembersArr[len(publicAndMembersArr)-1].lower():
        post = publicAndMembersArr[len(publicAndMembersArr)-1].strip()
      groupId = href.split('/')[-2]
      members = publicAndMembersArr[1].replace(
          'members', '').strip().replace('member', '')
      groupItem = GroupItem(groupId, title=title, url=href, visibility=publicAndMembersArr[0].strip(),
                            membersCount=members, desc=description, post=post)
      if groupItem.is_skip():
        continue
      if groupItem.title not in results:
        results[groupItem.title] = groupItem
        print(location, groupItem.to_str())

  return results


def main():
  parser = argparse.ArgumentParser(
      formatter_class=argparse.ArgumentDefaultsHelpFormatter)
  parser.add_argument(f"--state_code", "-s", type=str,
                      default='', help="state code")
  parser.add_argument(f"--city", "-c", type=str,
                      default='', help="city")
  parser.add_argument(f"--begin_city", "-b", type=str,
                      default='', help="beginning city")
  parser.add_argument(f"--redo", "-r", type=str, default='n',
                      help="if rewrite the output csv file.")

  args = parser.parse_args().__dict__
  arg_state_code = ''
  arg_city = ''
  arg_begin_city = ''
  arg_redo = 'n'
  if args['state_code']:
    arg_state_code = args['state_code'].lower()
  if args['city']:
    arg_city = args['city'].lower()
  if args['begin_city']:
    arg_begin_city = args['begin_city'].lower()
  if args['redo']:
    arg_redo = args['redo'].lower()

  if not arg_state_code:
    print('Error: no input state code found')
    return

  current_city = ''
  try:

    login()

    # ID,STATE_CODE,STATE_NAME,CITY,COUNTY,LATITUDE,LONGITUDE
    # 0       1         2        3    4      5         6
    csv_cities = read_csv_to_array('us_cities.csv')
    if len(csv_cities) != 29881:
      print('ERROR: cities file rows count are not correct:', len(csv_cities))
      return

    if arg_state_code:
      csv_cities = [row for row in csv_cities if row[1].lower() ==
                    arg_state_code]

    if arg_city:
      csv_cities = [row for row in csv_cities if row[3].lower() == arg_city]

    file_name = f'groups_{arg_state_code}.csv'
    if (arg_redo != 'n' and arg_redo != 'no') or (not os.path.exists(file_name)):
      write_array_to_csv(file_name, [GroupItem.get_arr_header()], mode='w')

    # ID,STATE_CODE,STATE_NAME,CITY,COUNTY,LATITUDE,LONGITUDE
    # 0       1         2        3    4      5         6
    skip = False
    if arg_begin_city:
      skip = True
    for i in range(0, len(csv_cities)):
      current_city = csv_cities[i][3]
      if skip and current_city.lower() == arg_begin_city:
        skip = False
      if skip:
        continue
      location = csv_cities[i][3] + ', ' + csv_cities[i][2]

      groupItems = getGroupListByLocation(location)
      groups = []
      for k in groupItems:
        group = GroupItem.from_instance(groupItems[k])
        group.city = csv_cities[i][3]
        group.state_code = csv_cities[i][1]
        group.state_name = csv_cities[i][2]
        group.latitude = float(csv_cities[i][5])
        group.longitude = float(csv_cities[i][6])
        groups.append(group.to_arr())

      # wrrite groups to file
      write_array_to_csv(file_name, groups)

    print(
        f'Congratulations of finishing this round, state_code: {arg_state_code}, city: {arg_city}, begin_city: {arg_begin_city}, redo: {arg_redo}')
  except Exception:
    print(traceback.format_exc())
    print('ERROR in city:', current_city)


if __name__ == "__main__":
  main()
