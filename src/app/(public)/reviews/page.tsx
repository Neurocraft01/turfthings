import { Star } from "lucide-react";

export default function ReviewsPage() {
  const reviews = [
    { name: "Alex Johnson", role: "Amateur League Player", text: "The best turf in the city. The lighting is perfect for night matches and the surface is top notch.", date: "May 28, 2026", rating: 5 },
    { name: "Sarah Williams", role: "Event Organizer", text: "Booking is seamless and the staff is incredibly helpful. Hosted a corporate tournament here and it was flawless.", date: "May 25, 2026", rating: 5 },
    { name: "David Chen", role: "Weekend Warrior", text: "Great facilities, clean locker rooms, and the turf quality really prevents injuries. Highly recommended!", date: "May 20, 2026", rating: 4 },
    { name: "Marcus Thompson", role: "Football Coach", text: "I bring my youth team here for training. The environment is safe, professional, and the turf is always well-maintained.", date: "May 15, 2026", rating: 5 },
    { name: "Jessica Lee", role: "Casual Player", text: "Love playing here with friends. The online booking system is a breeze. Only wish they had more vending machines.", date: "May 10, 2026", rating: 4 },
    { name: "Ryan Davies", role: "Tournament Organizer", text: "We've hosted our annual cup here twice. The management is very accommodating. Excellent lighting and seating.", date: "May 05, 2026", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl md:text-7xl text-foreground uppercase tracking-wider mb-6">
            Player <span className="text-brand">Reviews</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See what our community has to say about their experience on our turf.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Stats Summary */}
          <div className="md:w-1/3">
            <div className="bg-card p-8 rounded-xl border border-card-border sticky top-24">
              <h2 className="font-display text-3xl text-foreground uppercase mb-6">Overall Rating</h2>
              <div className="flex items-end mb-4">
                <span className="font-display text-6xl text-brand leading-none">4.8</span>
                <span className="text-xl text-gray-400 ml-2 mb-1">/ 5</span>
              </div>
              <div className="flex text-brand mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={24} fill={i < 4 ? "currentColor" : "none"} className={i === 4 ? "text-brand fill-brand/30" : ""} />
                ))}
              </div>
              <p className="text-gray-400 mb-8">Based on 124 player reviews</p>
              
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center text-sm">
                    <span className="w-4 text-gray-400">{rating}</span>
                    <Star size={14} className="text-gray-500 mx-2" />
                    <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand rounded-full" 
                        style={{ width: rating === 5 ? '85%' : rating === 4 ? '10%' : rating === 3 ? '5%' : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review List */}
          <div className="md:w-2/3">
            <div className="grid grid-cols-1 gap-6">
              {reviews.map((review, idx) => (
                <div key={idx} className="bg-card p-8 rounded-xl border border-card-border hover:border-brand/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex text-brand">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill={i < review.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="text-gray-300 mb-6 text-lg">"{review.text}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-brand/20 rounded-full flex items-center justify-center text-brand font-bold mr-3">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{review.name}</h4>
                      <p className="text-sm text-gray-500">{review.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <button className="bg-transparent border-2 border-brand text-brand hover:bg-brand hover:text-black font-bold py-3 px-8 rounded-sm uppercase tracking-wider transition-all">
                Load More Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
