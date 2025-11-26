class SynonymMapper:
    def __init__(self, synonym_mappings):
        self.synonym_mappings = synonym_mappings

    def add_synonyms(self, key, new_synonyms):
        """Add new synonyms for a given key."""
        if key in self.synonym_mappings:
            self.synonym_mappings[key].extend(new_synonyms)
        else:
            self.synonym_mappings[key] = new_synonyms

    def get_synonyms(self, term):
        """Retrieve all synonyms for a given term."""
        for key, synonyms in self.synonym_mappings.items():
            if term in synonyms:
                return key, synonyms
        return None, []

    def update_synonym(self, key, old_synonym, new_synonym):
        """Update a specific synonym for a given key."""
        if key in self.synonym_mappings and old_synonym in self.synonym_mappings[key]:
            index = self.synonym_mappings[key].index(old_synonym)
            self.synonym_mappings[key][index] = new_synonym

    def remove_synonym(self, key, synonym):
        """Remove a synonym from a given key."""
        if key in self.synonym_mappings and synonym in self.synonym_mappings[key]:
            self.synonym_mappings[key].remove(synonym)
