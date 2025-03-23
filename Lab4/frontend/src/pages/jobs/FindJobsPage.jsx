import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/utils/axios"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import JobCard from "@/components/ui/job/JobCard"

const FindJobsPage = () => {
  const [search, setSearch] = useState("")
  const [type, setType] = useState("all")

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ["jobs", { search, type }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (type !== "all") params.append("type", type)
      
      const { data } = await api.get(`/jobs?${params}`)
      return data
    }
  })

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(search.toLowerCase()) ||
    job.company.toLowerCase().includes(search.toLowerCase()) ||
    job.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Jobs</h1>
        <p className="text-muted-foreground">
          Discover the latest internship opportunities
        </p>
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Input
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-[300px]"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="md:w-[200px]">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
            <SelectItem value="adhoc">Ad-hoc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {isLoading ? (
        <div className="text-center">Loading jobs...</div>
      ) : error ? (
        <div className="text-center text-red-500">
          Error loading jobs: {error.message}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No jobs found matching your criteria
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}

export default FindJobsPage
