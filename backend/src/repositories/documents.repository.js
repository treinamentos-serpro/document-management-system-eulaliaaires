class DocumentsRepository {
  constructor() {
    this.documents = [];
  }

  save(document) {
    this.documents.push(document);
    return document;
  }

  findById(id) {
    return this.documents.find((document) => document.id === id) || null;
  }

  findByOwner(owner) {
    return this.documents
      .filter((document) => document.owner === owner)
      .sort((first, second) => (
        new Date(second.uploadedAt) - new Date(first.uploadedAt)
      ));
  }
}

module.exports = DocumentsRepository;