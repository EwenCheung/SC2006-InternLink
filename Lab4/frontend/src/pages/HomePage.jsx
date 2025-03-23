import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Find Your Perfect Internship Match
        </h1>
        <p className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Connect with top companies and discover opportunities that align with your career goals.
        </p>
        <div className="flex flex-col gap-4 min-[400px]:flex-row">
          <Link to="/jobs">
            <Button size="lg" className="w-full min-[400px]:w-auto">
              Browse Opportunities
            </Button>
          </Link>
          <Link to="/auth/choose-role">
            <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Why Choose InternLink?</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Discover what makes us the perfect platform for your career journey
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Easy Job Search</CardTitle>
              <CardDescription>Filter and find the perfect opportunities tailored to your skills and interests.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Direct Communication</CardTitle>
              <CardDescription>Connect directly with employers and get faster responses to your applications.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Career Growth</CardTitle>
              <CardDescription>Access mentorship opportunities and professional development resources.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <CardTitle className="text-2xl">Ready to Start Your Journey?</CardTitle>
            <CardDescription className="text-center">
              Join thousands of students who have found their dream internships through InternLink.
            </CardDescription>
            <Link to="/auth/choose-role">
              <Button size="lg">Create Account</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
