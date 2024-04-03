import csv


def read_csv_to_array(file: str):
  with open('us_cities.csv', newline='') as csvfile:
    rows = csv.reader(csvfile, delimiter=',')
    return [row for row in rows]


def write_array_to_csv(file: str, arr, include_header=True, mode='+a'):
  with open(file, mode=mode, encoding='utf-8') as f:
    i = 0
    if not include_header:
      i = 1
    for i in range(i, len(arr)):
      f.write(','.join(arr[i]) + '\n')
