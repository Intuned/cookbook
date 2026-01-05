class ItemCollector:
    def __init__(self):
        self.items: list[dict] = []

    def item_scraped(self, item, response, spider):
        self.items.append(dict(item))
