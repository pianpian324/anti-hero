export default function QuizTypeSelector({ onSelect }) {
  const quizTypes = [
    {
      id: 'web5',
      title: 'Web5 Fundamentals',
      icon: '🌐',
      description: 'Test your knowledge of Web5 core concepts'
    },
    {
      id: 'blockchain',
      title: 'Blockchain Basics',
      icon: '⛓️',
      description: 'Questions about blockchain technology'
    },
    {
      id: 'programming',
      title: 'Programming',
      icon: '💻',
      description: 'General programming concepts'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {quizTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type.id)}
          className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-left group"
        >
          <div className="text-4xl mb-4">{type.icon}</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {type.title}
          </h3>
          <p className="text-gray-600">{type.description}</p>
        </button>
      ))}
    </div>
  );
}
