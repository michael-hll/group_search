class GroupItem(object):
  def __init__(self, id, title='', url='', visibility='', membersCount='', desc='', post='', city='',
               state_code='', state_name='', latitude=0.0, longitude=0.0) -> None:
    self.id = id
    self.title = title
    self.url = url
    self.visibility = visibility
    self.membersCount = membersCount
    self.desc = desc
    self.post = post
    self.city = city
    self.state_code = state_code
    self.state_name = state_name
    self.latitude = latitude
    self.longitude = longitude

  def to_str(self):
    return f'{self.city},{self.id},{self.title},{self.url}, {self.visibility},{self.membersCount}'

  def to_arr(self):
    desc = self.desc.replace(",", ".")
    desc = desc.replace('"', "'")
    return [f'"{str(self.id)}"', self.title.replace(',', '$').replace('"', "'"), self.url, self.visibility, self.membersCount, str(self.__count_members()),
            f'"{desc}"', self.post, self.city, self.state_code, self.state_name, str(self.latitude), str(self.longitude)]

  def is_skip(self):
    if self.visibility != 'Private':
      return True
    if 'for buy' in self.desc.lower() or 'for sell' in self.desc.lower() or 'for sale' in self.desc.lower():
      return True
    if 'for buy' in self.title.lower() or 'for sell' in self.title.lower() or 'for sale' in self.title.lower():
      return True
    if 'buy & sell' in self.desc.lower():
      return True
    if 'buy & sell' in self.title.lower():
      return True
    if self.__count_members() < 1000:
      return True
    return False

  def __count_members(self):
    if not self.membersCount:
      return 0.0
    if 'K' in self.membersCount:
      return float(self.membersCount.replace('K', '')) * 1000
    else:
      return float(self.membersCount)

  @classmethod
  def get_arr_header(cls):
    return ['group_id', 'title', 'url', 'visibility', 'members_k', 'members', 'desc', 'post',
            'city', 'state_code', 'state_name', 'latitude', 'longitude']

  @classmethod
  def from_instance(cls, inst):
    return GroupItem(inst.id, title=inst.title, url=inst.url, visibility=inst.visibility, membersCount=inst.membersCount,
                     desc=inst.desc, post=inst.post, city=inst.city, state_code=inst.state_code, state_name=inst.state_name,
                     latitude=inst.latitude, longitude=inst.longitude)
