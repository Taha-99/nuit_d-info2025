const knowledge = [
  {
    id: 'svc_birth_certificate',
    question: 'Comment obtenir un acte de naissance ?',
    answer: 'Présentez une pièce d\'identité au centre d\'état civil ou utilisez le portail en ligne si disponible.'
  },
  {
    id: 'svc_passport',
    question: 'Quels documents pour un passeport ?',
    answer: 'Deux photos récentes, justificatif de domicile et carte nationale.'
  }
];

const getKnowledgeBase = (req, res) => {
  res.json(knowledge);
};

module.exports = { getKnowledgeBase };
